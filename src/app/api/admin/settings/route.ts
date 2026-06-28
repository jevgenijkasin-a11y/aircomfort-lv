export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { readJson, writeJson } from '@/lib/jsonDb';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(await readJson('settings.json'));
}

export async function PUT(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const data = await req.json();
  await writeJson('settings.json', data);
  return NextResponse.json({ success: true });
}
