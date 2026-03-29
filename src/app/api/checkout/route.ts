import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  await initializeDb();
  const body = await req.json();
  const { guest_name, guest_contact, contact_type, dedication, guest_image, items, payment_type, amount, currency } = body;

  const guestId = uuidv4();
  await sql`INSERT INTO guests (id, name, contact, contact_type) VALUES (${guestId}, ${guest_name}, ${guest_contact}, ${contact_type || 'whatsapp'})`;

  const paymentId = uuidv4();
  await sql`
    INSERT INTO payments (id, guest_id, payment_type, amount, status, currency, dedication, guest_image)
    VALUES (${paymentId}, ${guestId}, ${payment_type}, ${amount}, 'pending', ${currency || 'CZK'}, ${dedication || null}, ${guest_image || null})
  `;

  if (items && items.length > 0) {
    for (const item of items) {
      const piId = uuidv4();
      await sql`INSERT INTO payment_items (id, payment_id, item_id, quantity) VALUES (${piId}, ${paymentId}, ${item.item_id}, ${item.quantity})`;
    }
  }

  return NextResponse.json({ payment_id: paymentId, guest_id: guestId }, { status: 201 });
}
