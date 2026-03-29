import { NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';

export async function GET() {
  await initializeDb();
  const { rows } = await sql`
    SELECT p.*, g.name as guest_name, g.contact as guest_contact
    FROM payments p
    JOIN guests g ON p.guest_id = g.id
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(rows);
}
