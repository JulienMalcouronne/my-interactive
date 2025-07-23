import { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');

  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}|${userAgent}`;

  const body = await req.json();
  const fields: { [key: string]: number | string } = {};
  const allowedFields = ['name', 'score', 'multiplier'];

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      fields[key] = body[key];
    }
  }

  if (Object.keys(fields).length === 0) {
    return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build dynamic SET clause
  const updates = Object.keys(fields).map((key, i) => `${key} = $${i + 1}`);
  const values = Object.values(fields);

  try {
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE fingerprint = $${values.length + 1} RETURNING uid, name, score, multiplier`,
      [...values, fingerprint]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in PATCH /api/users/[uid]:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
