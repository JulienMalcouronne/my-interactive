import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

import { GET, POST } from './route';

const makeReq = (body: unknown, headers: Record<string, string> = {}): NextRequest =>
  new Request('http://localhost/api/dog-walk', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('POST /api/dog-walk', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('keeps the best run for the fingerprint', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ best_walk: 120 }] });

    const res = await POST(
      makeReq({ score: 90 }, { 'x-forwarded-for': '1.2.3.4', 'user-agent': 'vitest' })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ best: 120 });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('GREATEST');
    expect(values).toEqual([90, '1.2.3.4|vitest']);
  });

  test('clamps the score before storing it', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ best_walk: 1000000 }] });

    await POST(makeReq({ score: 9_999_999 }));

    expect(query.mock.calls[0][1][0]).toBe(1_000_000);
  });

  test('rejects a non-numeric score', async () => {
    const res = await POST(makeReq({ score: 'lots' }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid score' });
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

describe('GET /api/dog-walk', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

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
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
