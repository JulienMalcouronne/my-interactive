import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        users.id,
        users.uid,
        users.name,
        users.score
      FROM users
      ORDER BY users.score DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
