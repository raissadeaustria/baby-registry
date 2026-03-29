import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  db.prepare(`
    UPDATE items SET name = ?, description = ?, price = ?, price_currency = ?, delivery_price = ?, source_url = ?,
    image_url = ?, category = ?, quantity_needed = ?, priority = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    body.name, body.description || null, body.price, body.price_currency || 'CZK', body.delivery_price || 0,
    body.source_url || null, body.image_url || null,
    body.category || 'general', body.quantity_needed || 1, body.priority || 'medium', id
  );

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM payment_items WHERE item_id = ?').run(id);
  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
