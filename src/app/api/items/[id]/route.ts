import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await initializeDb();
  const body = await req.json();

  await sql`
    UPDATE items SET name = ${body.name}, description = ${body.description || null}, price = ${body.price},
    price_currency = ${body.price_currency || 'CZK'}, delivery_price = ${body.delivery_price || 0},
    source_url = ${body.source_url || null}, image_url = ${body.image_url || null},
    category = ${body.category || 'general'}, quantity_needed = ${body.quantity_needed || 1},
    priority = ${body.priority || 'medium'}, updated_at = NOW()
    WHERE id = ${id}
  `;

  const { rows } = await sql`SELECT * FROM items WHERE id = ${id}`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await initializeDb();
  await sql`DELETE FROM payment_items WHERE item_id = ${id}`;
  await sql`DELETE FROM items WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
