import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  db.prepare("UPDATE payments SET status = 'confirmed' WHERE id = ?").run(id);

  const paymentItems = db.prepare(
    'SELECT item_id, quantity FROM payment_items WHERE payment_id = ?'
  ).all(id) as { item_id: string; quantity: number }[];

  const updateItem = db.prepare(
    'UPDATE items SET quantity_fulfilled = MIN(quantity_fulfilled + ?, quantity_needed) WHERE id = ?'
  );

  for (const pi of paymentItems) {
    updateItem.run(pi.quantity, pi.item_id);
  }

  return NextResponse.json({ success: true, updated: paymentItems.length });
}
