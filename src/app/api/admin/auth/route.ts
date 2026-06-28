export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { login, logout, verifySession, AUTH_COOKIE } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const authenticated = await verifySession(req);
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const token = await login(password);
  if (!token) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  await logout();
  const res = NextResponse.json({ success: true });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
