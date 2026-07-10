import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCookieSecret, visitorIdFromCookie } from '@/lib/visitor';
import { rateLimit } from '@/lib/rateLimit';

type PatchBody = Partial<{
  name: string;
  score: number;
  multiplier: number;
}>;

// Idle score is cosmetic, but still bound it to keep the leaderboard sane.
const MAX_SCORE = 1_000_000;

export async function PATCH(req: NextRequest) {
  const vid = visitorIdFromCookie(req.headers.get('cookie'), getCookieSecret());
  if (!vid) {
    return NextResponse.json({ error: 'No visitor session' }, { status: 401 });
  }
  if (!rateLimit(`users:${vid}`, 60, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await req.json()) as PatchBody;
  const fields: Record<string, string | number> = {};

  if (typeof body.name === 'string') fields.name = body.name;
  if (typeof body.score === 'number' && Number.isFinite(body.score)) {
    fields.score = Math.min(Math.max(Math.round(body.score), 0), MAX_SCORE);
  }
  if (typeof body.multiplier === 'number' && Number.isFinite(body.multiplier)) {
    fields.multiplier = body.multiplier;
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const updates = Object.keys(fields).map((key, i) => `${key} = $${i + 1}`);
  const values = Object.values(fields);

  try {
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE visitor_id = $${values.length + 1} RETURNING uid, name, score, multiplier`,
      [...values, vid]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
