import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDb } from '@/lib/db';
import type { Settings } from '@/lib/types';

export async function GET() {
  await initializeDb();
  const { rows } = await sql`SELECT key, value FROM settings`;
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings as unknown as Settings);
}

export async function PUT(req: NextRequest) {
  await initializeDb();
  const body = await req.json();

  for (const [key, value] of Object.entries(body)) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${String(value)}) ON CONFLICT (key) DO UPDATE SET value = ${String(value)}`;
  }

  return NextResponse.json({ success: true });
}
