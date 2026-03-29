import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  const db = getDb();
  const payments = db.prepare(`
    SELECT p.*, g.name as guest_name, g.contact as guest_contact
    FROM payments p
    JOIN guests g ON p.guest_id = g.id
    ORDER BY p.created_at DESC
  `).all();

  return NextResponse.json(payments);
}
