import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { IIndividualCarbonFields } from '@/interfaces';
import { VISITOR_COOKIE, signVisitorToken } from '@/lib/visitor';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

const { rateLimitMock } = vi.hoisted(() => ({
  rateLimitMock: vi.fn(() => ({ allowed: true, remaining: 99 })),
}));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: rateLimitMock }));

import { POST } from './route';

const SECRET = 'test-secret';
const cookieFor = (vid: string) => `${VISITOR_COOKIE}=${signVisitorToken(vid, SECRET)}`;

const validForm: IIndividualCarbonFields = {
  transportMode: 'walk',
  carType: 'essence',
  dailyCommuteKm: 0,
  commuteDaysPerWeek: 5,
  carpoolSize: 1,
  shortFlightsPerYear: 0,
  mediumFlightsPerYear: 0,
  longFlightsPerYear: 0,
  meatConsumption: 'none', // -> total 200
  homeSize: 0,
  heating: 'gas',
  isWellInsulated: false,
  hasRenewableElectricity: false,
  peopleInHousehold: 1,
  clothesPerYear: 0,
  devicesPerYear: 0,
};

const makeReq = (body: unknown, vid: string | null = 'v1'): NextRequest =>
  new Request('http://localhost/api/carbon', {
    method: 'POST',
    headers: vid ? { cookie: cookieFor(vid) } : {},
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('POST /api/carbon', () => {
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

  test('returns 401 without a visitor cookie', async () => {
    const res = await POST(makeReq(validForm, null));
    expect(res.status).toBe(401);
  });

  test('returns 429 when rate-limited', async () => {
    rateLimitMock.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const res = await POST(makeReq(validForm));
    expect(res.status).toBe(429);
  });

  test('computes the total server-side and upserts it by visitor id', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    const res = await POST(makeReq(validForm, 'visitor-7'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ carbonTotal: 1700 }); // 200 + 1500 baseline
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('WHERE visitor_id = $2');
    expect(values).toEqual([1700, 'visitor-7']);
  });

  test('clamps absurd totals before adding the baseline', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    const res = await POST(makeReq({ ...validForm, longFlightsPerYear: 1000 }));
    expect(await res.json()).toEqual({ carbonTotal: 51500 });
  });

  test('rejects a non-object payload', async () => {
    const res = await POST(makeReq(null));
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  test('rejects data that does not compute to a finite total', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  test('returns 404 when the user is unknown', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const res = await POST(makeReq(validForm));
    expect(res.status).toBe(404);
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const res = await POST(makeReq(validForm));
    expect(res.status).toBe(500);
  });
});
