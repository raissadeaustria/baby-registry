import { sql } from '@vercel/postgres';

export async function initializeDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      price_currency TEXT DEFAULT 'CZK',
      delivery_price REAL DEFAULT 0,
      source_url TEXT,
      image_url TEXT,
      category TEXT DEFAULT 'general',
      quantity_needed INTEGER DEFAULT 1,
      quantity_fulfilled INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      contact_type TEXT DEFAULT 'whatsapp',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      guest_id TEXT NOT NULL REFERENCES guests(id),
      payment_type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      currency TEXT DEFAULT 'CZK',
      dedication TEXT,
      guest_image TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_items (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL REFERENCES payments(id),
      item_id TEXT NOT NULL REFERENCES items(id),
      quantity INTEGER DEFAULT 1
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;

  const defaults = [
    ['theme', 'boy'],
    ['mom_name', 'Mom'],
    ['baby_name', 'Baby'],
    ['welcome_message', 'Welcome to our Baby Registry!'],
    ['bank_details', ''],
    ['bank_accounts_eur', '[]'],
    ['bank_accounts_czk', '[]'],
    ['revolut_link_eur', ''],
    ['revolut_link_czk', ''],
    ['bizum_phone', ''],
    ['thank_you_message', 'Thank you so much for your generous gift! We are truly grateful.'],
    ['thank_you_message_es', 'Muchas gracias por tu generoso regalo. Estamos muy agradecidos.'],
    ['thank_you_message_cz', 'Mockrát děkujeme za váš štědrý dárek! Jsme vám velmi vděční.'],
    ['currency', 'CZK'],
  ];

  for (const [key, value] of defaults) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`;
  }
}

export { sql };
