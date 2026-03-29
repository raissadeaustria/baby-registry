import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'registry.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      contact_type TEXT DEFAULT 'whatsapp',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      guest_id TEXT NOT NULL,
      payment_type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      currency TEXT DEFAULT 'CZK',
      dedication TEXT,
      guest_image TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (guest_id) REFERENCES guests(id)
    );

    CREATE TABLE IF NOT EXISTS payment_items (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (payment_id) REFERENCES payments(id),
      FOREIGN KEY (item_id) REFERENCES items(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'boy');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('mom_name', 'Mom');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('baby_name', 'Baby');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('welcome_message', 'Welcome to our Baby Registry!');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('bank_details', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('bank_accounts_eur', '[]');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('bank_accounts_czk', '[]');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('revolut_link_eur', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('revolut_link_czk', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('bizum_phone', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('thank_you_message', 'Thank you so much for your generous gift! We are truly grateful.');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('thank_you_message_es', 'Muchas gracias por tu generoso regalo. Estamos muy agradecidos.');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('thank_you_message_cz', 'Mockrát děkujeme za váš štědrý dárek! Jsme vám velmi vděční.');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'CZK');
  `);
}

export default getDb;
