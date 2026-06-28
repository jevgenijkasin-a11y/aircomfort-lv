export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { readJson, writeJson } from '@/lib/jsonDb';

interface RequestEntry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const data = await readJson<RequestEntry[]>('requests.json');
  return NextResponse.json([...data].reverse());
}

export async function DELETE(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await req.json();
  const data = await readJson<RequestEntry[]>('requests.json');
  await writeJson('requests.json', data.filter((r) => r.id !== id));
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await req.json();
  const data = await readJson<RequestEntry[]>('requests.json');
  await writeJson('requests.json', data.map((r) => (r.id === id ? { ...r, read: true } : r)));
  return NextResponse.json({ success: true });
}
