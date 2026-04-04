import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPass = process.env.ADMIN_PASSWORD || 'baby2026';

  if (password === adminPass) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
}
