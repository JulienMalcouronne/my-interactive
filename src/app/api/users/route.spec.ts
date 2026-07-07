import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

import { PATCH } from './route';

const makeReq = (body: unknown, headers: Record<string, string> = {}): NextRequest =>
  new Request('http://localhost/api/users', {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('PATCH /api/users', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('returns 400 when no valid field is provided', async () => {
    const res = await PATCH(makeReq({ score: Number.NaN, multiplier: Infinity }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'No valid fields to update' });
    expect(query).not.toHaveBeenCalled();
  });

  test('updates the name only and derives the fingerprint from headers', async () => {
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ uid: 'u1', name: 'Neo', score: 5, multiplier: 1 }],
    });

    const res = await PATCH(
      makeReq({ name: 'Neo' }, { 'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'user-agent': 'vitest' })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ uid: 'u1', name: 'Neo', score: 5, multiplier: 1 });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('name = $1');
    expect(values).toEqual(['Neo', '1.2.3.4|vitest']);
  });

  test('rounds the score and keeps the multiplier', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ uid: 'u1' }] });

    await PATCH(makeReq({ score: 12.7, multiplier: 3 }));

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('score = $1');
    expect(sql).toContain('multiplier = $2');
    // score rounded to 13, multiplier untouched, fingerprint as last value
    expect(values).toEqual([13, 3, 'unknown|unknown']);
  });

  test('returns 404 when no user matches the fingerprint', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await PATCH(makeReq({ name: 'Ghost' }));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'User not found' });
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));

    const res = await PATCH(makeReq({ name: 'Neo' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
