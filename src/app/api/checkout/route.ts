import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { guest_name, guest_contact, contact_type, dedication, guest_image, items, payment_type, amount, currency } = body;

  const guestId = uuidv4();
  db.prepare('INSERT INTO guests (id, name, contact, contact_type) VALUES (?, ?, ?, ?)').run(
    guestId, guest_name, guest_contact, contact_type || 'whatsapp'
  );

  const paymentId = uuidv4();
  db.prepare(`
    INSERT INTO payments (id, guest_id, payment_type, amount, status, currency, dedication, guest_image)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(paymentId, guestId, payment_type, amount, currency || 'CZK', dedication || null, guest_image || null);

  if (items && items.length > 0) {
    const insertItem = db.prepare(
      'INSERT INTO payment_items (id, payment_id, item_id, quantity) VALUES (?, ?, ?, ?)'
    );

    for (const item of items) {
      insertItem.run(uuidv4(), paymentId, item.item_id, item.quantity);
    }
  }

  return NextResponse.json({ payment_id: paymentId, guest_id: guestId }, { status: 201 });
}
