export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/jsonDb';
import { randomUUID } from 'crypto';

interface RequestEntry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export async function POST(req: NextRequest) {
  const { name, phone, email, message } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }
  const entry: RequestEntry = {
    id: randomUUID(),
    name,
    phone,
    email: email || '',
    message: message || '',
    createdAt: new Date().toISOString(),
    read: false,
  };
  const requests = await readJson<RequestEntry[]>('requests.json');
  requests.push(entry);
  await writeJson('requests.json', requests);
  return NextResponse.json({ success: true });
}
