import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

import { GET } from './route';

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('returns the ordered rows', async () => {
    const rows = [
      { id: 1, uid: 'a', name: 'Alice', score: 30 },
      { id: 2, uid: 'b', name: 'Bob', score: 10 },
    ];
    query.mockResolvedValueOnce({ rows });

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });

  test('returns 500 when the query fails', async () => {
    query.mockRejectedValueOnce(new Error('db down'));

    const res = await GET();

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
