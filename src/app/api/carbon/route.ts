import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { calculateCO2, PUBLIC_SERVICES_KG } from '@/lib';
import { getCookieSecret, visitorIdFromCookie } from '@/lib/visitor';
import { rateLimit } from '@/lib/rateLimit';
import type { IIndividualCarbonFields } from '@/interfaces';

const MAX_TOTAL_KG = 50000;

export async function POST(req: NextRequest) {
  const vid = visitorIdFromCookie(req.headers.get('cookie'), getCookieSecret());
  if (!vid) {
    return NextResponse.json({ error: 'No visitor session' }, { status: 401 });
  }
  if (!rateLimit(`carbon:${vid}`, 20, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // The total is recomputed server-side (authoritative) and clamped to a sane range.
  const { total } = calculateCO2(body as IIndividualCarbonFields);
  if (!Number.isFinite(total)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Store the full footprint: personal total (clamped) + the public-services baseline.
  const carbonTotal = Math.min(Math.max(Math.round(total), 0), MAX_TOTAL_KG) + PUBLIC_SERVICES_KG;

  try {
    const result = await pool.query(
      'UPDATE users SET carbon_total = $1 WHERE visitor_id = $2 RETURNING id',
      [carbonTotal, vid]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ carbonTotal }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/carbon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
