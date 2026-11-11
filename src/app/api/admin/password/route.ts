export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, changePassword } from '@/lib/adminAuth';

export async function PUT(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  // The same rule as the admin form, enforced here too (an empty password would lock the admin out)
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
    return NextResponse.json({ error: 'Password must be 8–200 characters' }, { status: 400 });
  }
  const ok = await changePassword(currentPassword, newPassword);
  if (!ok) return NextResponse.json({ error: 'Wrong current password' }, { status: 400 });
  return NextResponse.json({ success: true });
}
