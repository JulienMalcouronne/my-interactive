import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        users.id,
        users.uid,
        users.name,
        scores.score
      FROM scores
      JOIN users ON scores.user_id = users.id
      ORDER BY scores.score DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
