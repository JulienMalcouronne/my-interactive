import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { VISITOR_COOKIE, signVisitorToken } from '@/lib/visitor';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

const { rateLimitMock } = vi.hoisted(() => ({
  rateLimitMock: vi.fn(() => ({ allowed: true, remaining: 99 })),
}));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: rateLimitMock }));

import { PATCH } from './route';

const SECRET = 'test-secret';
const cookieFor = (vid: string) => `${VISITOR_COOKIE}=${signVisitorToken(vid, SECRET)}`;

const makeReq = (body: unknown, vid: string | null = 'v1'): NextRequest =>
  new Request('http://localhost/api/users', {
    method: 'PATCH',
    headers: vid ? { cookie: cookieFor(vid) } : {},
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('PATCH /api/users', () => {
  beforeEach(() => {
    vi.stubEnv('COOKIE_SECRET', SECRET);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    rateLimitMock.mockReturnValue({ allowed: true, remaining: 99 });
  });

  test('returns 401 without a valid visitor cookie', async () => {
    const res = await PATCH(makeReq({ name: 'Neo' }, null));
    expect(res.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  test('returns 429 when rate-limited', async () => {
    rateLimitMock.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const res = await PATCH(makeReq({ name: 'Neo' }));
    expect(res.status).toBe(429);
  });

  test('returns 400 when no valid field is provided', async () => {
    const res = await PATCH(makeReq({ score: Number.NaN, multiplier: Infinity }));
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  test('updates the name and scopes the query to the visitor id', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ uid: 'u1', name: 'Neo' }] });
    const res = await PATCH(makeReq({ name: 'Neo' }, 'visitor-42'));

    expect(res.status).toBe(200);
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('name = $1');
    expect(sql).toContain('WHERE visitor_id = $2');
    expect(values).toEqual(['Neo', 'visitor-42']);
  });

  test('rounds and clamps the score', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ uid: 'u1' }] });
    await PATCH(makeReq({ score: 9_999_999, multiplier: 3 }));
    const [, values] = query.mock.calls[0];
    expect(values).toEqual([1_000_000, 3, 'v1']);
  });

  test('floors a negative score at zero', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ uid: 'u1' }] });
    await PATCH(makeReq({ score: -50 }));
    expect(query.mock.calls[0][1][0]).toBe(0);
  });

  test('returns 404 when no user matches', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const res = await PATCH(makeReq({ name: 'Ghost' }));
    expect(res.status).toBe(404);
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const res = await PATCH(makeReq({ name: 'Neo' }));
    expect(res.status).toBe(500);
  });
});
