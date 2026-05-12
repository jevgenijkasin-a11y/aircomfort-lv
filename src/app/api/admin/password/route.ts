import { NextRequest, NextResponse } from 'next/server';
import { verifySession, changePassword } from '@/lib/adminAuth';

export async function PUT(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { currentPassword, newPassword } = await req.json();
  const ok = await changePassword(currentPassword, newPassword);
  if (!ok) return NextResponse.json({ error: 'Wrong current password' }, { status: 400 });
  return NextResponse.json({ success: true });
}
