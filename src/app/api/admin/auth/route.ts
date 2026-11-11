export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { login, logout, verifySession, AUTH_COOKIE } from '@/lib/adminAuth';
import { clientIp, tooMany, block, blockedFor, unblock } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const authenticated = await verifySession(req);
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  // Brute force: the 5th wrong password within 15 minutes blocks the address for 15 minutes
  const key = `login:${clientIp(req)}`;
  const wait = blockedFor(key);
  if (wait) return NextResponse.json({ error: 'Too many attempts' }, { status: 429, headers: { 'Retry-After': String(wait) } });
  const { password } = await req.json().catch(() => ({}));
  const token = await login(typeof password === 'string' ? password : '');
  if (!token) {
    if (tooMany(key, 4, 15 * 60_000)) block(key, 15 * 60_000);
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  unblock(key);
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
