import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { IIndividualCarbonFields } from '@/interfaces';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

import { POST } from './route';

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

const makeReq = (body: unknown, headers: Record<string, string> = {}): NextRequest =>
  new Request('http://localhost/api/carbon', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('POST /api/carbon', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('computes the total server-side and upserts it by fingerprint', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const res = await POST(
      makeReq(validForm, { 'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'user-agent': 'vitest' })
    );

    expect(res.status).toBe(200);
    // personal total 200 + public-services baseline 1500
    expect(await res.json()).toEqual({ carbonTotal: 1700 });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('UPDATE users SET carbon_total');
    expect(values).toEqual([1700, '1.2.3.4|vitest']);
  });

  test('clamps absurd totals to the maximum (before adding the baseline)', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const res = await POST(makeReq({ ...validForm, longFlightsPerYear: 1000 }));

    // personal total clamped to 50000, then + 1500 baseline
    expect(await res.json()).toEqual({ carbonTotal: 51500 });
  });

  test('rejects a non-object payload', async () => {
    const res = await POST(makeReq(null));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid payload' });
    expect(query).not.toHaveBeenCalled();
  });

  test('rejects data that does not compute to a finite total', async () => {
    const res = await POST(makeReq({}));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid data' });
    expect(query).not.toHaveBeenCalled();
  });

  test('returns 404 when no user matches the fingerprint', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await POST(makeReq(validForm));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'User not found' });
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));

    const res = await POST(makeReq(validForm));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
