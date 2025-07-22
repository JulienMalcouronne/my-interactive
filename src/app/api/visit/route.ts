import { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid name' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const forwarded = req.headers.get('x-forwarded-for');

  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}|${userAgent}`;

  try {
    const existing = await pool.query(
      'SELECT uid, name, id, score, multiplier FROM users WHERE fingerprint = $1 LIMIT 1',
      [fingerprint]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return new Response(JSON.stringify({ ...existing.rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const created = await pool.query(
      'INSERT INTO users (name, ip, user_agent, fingerprint) VALUES ($1, $2, $3, $4) RETURNING  uid, name, id, score, multiplier',
      [name, ip, userAgent, fingerprint]
    );

    return new Response(JSON.stringify({ userId: created.rows[0].id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/visit:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
