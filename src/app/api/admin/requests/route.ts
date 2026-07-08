export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listContacts, setContactStatus, deleteContact } from '@/lib/db';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(await listContacts());
}

export async function PATCH(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { id, status } = await req.json();
  await setContactStatus(Number(id), status || 'read');
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await req.json();
  await deleteContact(Number(id));
  return NextResponse.json({ success: true });
}
