import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { VISITOR_COOKIE, signVisitorToken, verifyVisitorToken } from '@/lib/visitor';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

const { rateLimitMock } = vi.hoisted(() => ({
  rateLimitMock: vi.fn(() => ({ allowed: true, remaining: 99 })),
}));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: rateLimitMock }));

import { POST } from './route';

const SECRET = 'test-secret';
const cookieFor = (vid: string) => `${VISITOR_COOKIE}=${signVisitorToken(vid, SECRET)}`;

const makeReq = (body: unknown, headers: Record<string, string> = {}): NextRequest =>
  new Request('http://localhost/api/visit', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('POST /api/visit', () => {
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

  test('returns 429 when rate-limited', async () => {
    rateLimitMock.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const res = await POST(makeReq({ name: 'Neo' }));
    expect(res.status).toBe(429);
    expect(query).not.toHaveBeenCalled();
  });

  test('returns 400 when the name is missing', async () => {
    const res = await POST(makeReq({}, { cookie: cookieFor('v1') }));
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  test('returns 400 when the name is not a string', async () => {
    const res = await POST(makeReq({ name: 123 }, { cookie: cookieFor('v1') }));
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  test('returns the existing visitor and refreshes the cookie', async () => {
    const existing = { uid: 'u1', name: 'Neo', id: 1, score: 4, multiplier: 1 };
    query.mockResolvedValueOnce({ rowCount: 1, rows: [existing] });

    const res = await POST(makeReq({ name: 'Neo' }, { cookie: cookieFor('visitor-1') }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(existing);
    // looked up by the verified visitor id
    expect(query.mock.calls[0][1]).toEqual(['visitor-1']);
    // signed cookie set back
    expect(verifyVisitorToken(res.cookies.get(VISITOR_COOKIE)?.value, SECRET)).toBe('visitor-1');
  });

  test('mints a new visitor id and creates the user when there is no cookie', async () => {
    query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ uid: 'u9', name: 'Trinity', id: 9 }] });

    const res = await POST(makeReq({ name: 'Trinity' }, { 'x-forwarded-for': '1.2.3.4' }));

    expect(res.status).toBe(201);
    const token = res.cookies.get(VISITOR_COOKIE)?.value;
    const newVid = verifyVisitorToken(token, SECRET);
    expect(newVid).toBeTruthy();
    // the freshly minted id is used for both the lookup and the insert
    expect(query.mock.calls[0][1]).toEqual([newVid]);
    expect(query.mock.calls[1][1]).toContain(newVid);
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const res = await POST(makeReq({ name: 'Neo' }, { cookie: cookieFor('v1') }));
    expect(res.status).toBe(500);
  });
});
