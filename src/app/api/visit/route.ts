import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import {
  VISITOR_COOKIE,
  createVisitorId,
  getCookieSecret,
  signVisitorToken,
  visitorIdFromCookie,
} from '@/lib/visitor';
import { rateLimit } from '@/lib/rateLimit';

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // New visitors are rate-limited by IP (they have no id yet) to stop mass sign-ups.
  if (!rateLimit(`visit:${ip}`, 30, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const secret = getCookieSecret();
  const vid = visitorIdFromCookie(req.headers.get('cookie'), secret) ?? createVisitorId();

  const { name } = await req.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid name' }, { status: 400 });
  }

  const withCookie = (body: unknown, status: number) => {
    const res = NextResponse.json(body, { status });
    res.cookies.set(VISITOR_COOKIE, signVisitorToken(vid, secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: YEAR_SECONDS,
    });
    return res;
  };

  try {
    const existing = await pool.query(
      'SELECT uid, name, id, score, multiplier FROM users WHERE visitor_id = $1 LIMIT 1',
      [vid]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return withCookie(existing.rows[0], 200);
    }

    const created = await pool.query(
      `INSERT INTO users (name, ip, user_agent, visitor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING uid, name, id, score, multiplier`,
      [name, ip, userAgent, vid]
    );

    return withCookie(created.rows[0], 201);
  } catch (error) {
    console.error('Error in /api/visit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
