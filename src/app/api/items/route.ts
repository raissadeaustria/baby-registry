import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = getDb();
  const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO items (id, name, description, price, price_currency, delivery_price, source_url, image_url, category, quantity_needed, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.name,
    body.description || null,
    body.price,
    body.price_currency || 'CZK',
    body.delivery_price || 0,
    body.source_url || null,
    body.image_url || null,
    body.category || 'general',
    body.quantity_needed || 1,
    body.priority || 'medium'
  );

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  return NextResponse.json(item, { status: 201 });
}
