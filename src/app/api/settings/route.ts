import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import type { Settings } from '@/lib/types';

export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings as unknown as Settings);
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
  );

  for (const [key, value] of Object.entries(body)) {
    upsert.run(key, String(value), String(value));
  }

  return NextResponse.json({ success: true });
}
