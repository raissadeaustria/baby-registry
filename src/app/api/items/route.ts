import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  await initializeDb();
  const { rows } = await sql`SELECT * FROM items ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initializeDb();
  const body = await req.json();
  const id = uuidv4();

  await sql`
    INSERT INTO items (id, name, description, price, price_currency, delivery_price, source_url, image_url, category, quantity_needed, priority)
    VALUES (${id}, ${body.name}, ${body.description || null}, ${body.price}, ${body.price_currency || 'CZK'}, ${body.delivery_price || 0}, ${body.source_url || null}, ${body.image_url || null}, ${body.category || 'general'}, ${body.quantity_needed || 1}, ${body.priority || 'medium'})
  `;

  const { rows } = await sql`SELECT * FROM items WHERE id = ${id}`;
  return NextResponse.json(rows[0], { status: 201 });
}
