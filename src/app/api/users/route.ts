import { NextRequest } from 'next/server';
import pool from '@/lib/db';

type PatchBody = Partial<{
  name: string;
  score: number;
  multiplier: number;
}>;

export async function PATCH(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');

  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}|${userAgent}`;

  const body = (await req.json()) as PatchBody;

  const fields: Record<string, string | number> = {};

  if (typeof body.name === 'string') fields.name = body.name;

  if (typeof body.score === 'number' && Number.isFinite(body.score)) {
    fields.score = Math.round(body.score);
  }

  if (typeof body.multiplier === 'number' && Number.isFinite(body.multiplier)) {
    fields.multiplier = body.multiplier;
  }

  if (Object.keys(fields).length === 0) {
    return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
