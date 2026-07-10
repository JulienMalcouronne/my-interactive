import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCookieSecret, visitorIdFromCookie } from '@/lib/visitor';
import { rateLimit } from '@/lib/rateLimit';

const MAX_SCORE = 1_000_000;

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT name, best_walk FROM users WHERE best_walk IS NOT NULL ORDER BY best_walk DESC LIMIT 5'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error in GET /api/dog-walk:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const vid = visitorIdFromCookie(req.headers.get('cookie'), getCookieSecret());
  if (!vid) {
    return NextResponse.json({ error: 'No visitor session' }, { status: 401 });
  }
  if (!rateLimit(`dog-walk:${vid}`, 30, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json();
  const score = (body as { score?: unknown })?.score;

  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  const runScore = Math.min(Math.max(Math.round(score), 0), MAX_SCORE);

  try {
    // Keep only the best run for this visitor.
    const result = await pool.query(
      'UPDATE users SET best_walk = GREATEST(COALESCE(best_walk, 0), $1) WHERE visitor_id = $2 RETURNING best_walk',
      [runScore, vid]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ best: result.rows[0].best_walk }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/dog-walk:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
