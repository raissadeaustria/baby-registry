import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await initializeDb();
  await sql`UPDATE items SET quantity_fulfilled = quantity_needed WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await initializeDb();
  await sql`UPDATE items SET quantity_fulfilled = 0 WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
