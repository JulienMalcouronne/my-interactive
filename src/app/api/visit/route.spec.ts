import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { query } }));

import { POST } from './route';

const makeReq = (body: unknown, headers: Record<string, string> = {}): NextRequest =>
  new Request('http://localhost/api/visit', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe('POST /api/visit', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('returns 400 when the name is missing or invalid', async () => {
    const res = await POST(makeReq({ name: 123 }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Missing or invalid name' });
    expect(query).not.toHaveBeenCalled();
  });

  test('returns the existing user (200) and parses the forwarded IP', async () => {
    const existing = { uid: 'u1', name: 'Neo', id: 1, score: 4, multiplier: 1 };
    query.mockResolvedValueOnce({ rowCount: 1, rows: [existing] });

    const res = await POST(
      makeReq({ name: 'Neo' }, { 'x-forwarded-for': '8.8.8.8, 9.9.9.9', 'user-agent': 'vitest' })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(existing);

    const [, values] = query.mock.calls[0];
    expect(values).toEqual(['8.8.8.8|vitest']);
  });

  test('creates a new user (201) when none exists', async () => {
    query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 42 }] });

    const res = await POST(makeReq({ name: 'Trinity' }));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ userId: 42 });

    // insert uses the fallback fingerprint when no forwarded header is present
    const [, insertValues] = query.mock.calls[1];
    expect(insertValues).toEqual(['Trinity', 'unknown', 'unknown', 'unknown|unknown']);
  });

  test('returns 500 when the query throws', async () => {
    query.mockRejectedValueOnce(new Error('boom'));

    const res = await POST(makeReq({ name: 'Neo' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
