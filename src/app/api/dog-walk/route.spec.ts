import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { VISITOR_COOKIE, signVisitorToken } from '@/lib/visitor';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

const { rateLimitMock } = vi.hoisted(() => ({
  rateLimitMock: vi.fn(() => ({ allowed: true, remaining: 99 })),
}));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: rateLimitMock }));

import { GET, POST } from './route';

const SECRET = 'test-secret';
const cookieFor = (vid: string) => `${VISITOR_COOKIE}=${signVisitorToken(vid, SECRET)}`;

const makeReq = (body: unknown, vid: string | null = 'v1'): NextRequest =>
  new Request('http://localhost/api/dog-walk', {
    method: 'POST',
    headers: vid ? { cookie: cookieFor(vid) } : {},
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

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

describe('GET /api/dog-walk', () => {
  test('returns the top walkers', async () => {
    const rows = [
      { name: 'SilverFox10', best_walk: 320 },
      { name: 'RapidSeeker92', best_walk: 180 },
    ];
    query.mockResolvedValueOnce({ rows });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
    expect(query.mock.calls[0][0]).toContain('ORDER BY best_walk DESC LIMIT 5');
  });

  test('returns 500 when the query fails', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('POST /api/dog-walk', () => {
  test('returns 401 without a visitor cookie', async () => {
    const res = await POST(makeReq({ score: 10 }, null));
    expect(res.status).toBe(401);
  });

  test('returns 429 when rate-limited', async () => {
    rateLimitMock.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const res = await POST(makeReq({ score: 10 }));
    expect(res.status).toBe(429);
  });

  test('keeps the best run for the visitor', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ best_walk: 120 }] });
    const res = await POST(makeReq({ score: 90 }, 'visitor-3'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ best: 120 });
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('GREATEST');
    expect(sql).toContain('WHERE visitor_id = $2');
    expect(values).toEqual([90, 'visitor-3']);
  });

  test('clamps the score before storing it', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ best_walk: 1_000_000 }] });
    await POST(makeReq({ score: 9_999_999 }));
    expect(query.mock.calls[0][1][0]).toBe(1_000_000);
  });

  test('rejects a non-numeric score', async () => {
    const res = await POST(makeReq({ score: 'lots' }));
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  test('returns 404 when the user is unknown', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const res = await POST(makeReq({ score: 10 }));
    expect(res.status).toBe(404);
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const res = await POST(makeReq({ score: 10 }));
    expect(res.status).toBe(500);
  });
});
