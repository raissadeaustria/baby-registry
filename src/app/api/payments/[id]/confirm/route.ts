import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await initializeDb();

  await sql`UPDATE payments SET status = 'confirmed' WHERE id = ${id}`;

  const { rows: paymentItems } = await sql`
    SELECT item_id, quantity FROM payment_items WHERE payment_id = ${id}
  `;

  for (const pi of paymentItems) {
    await sql`UPDATE items SET quantity_fulfilled = LEAST(quantity_fulfilled + ${pi.quantity}, quantity_needed) WHERE id = ${pi.item_id}`;
  }

  return NextResponse.json({ success: true, updated: paymentItems.length });
}
