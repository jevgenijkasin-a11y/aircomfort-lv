export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { updateHeroSlide, deleteHeroSlide } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  await updateHeroSlide(Number(id), await req.json());
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  await deleteHeroSlide(Number(id));
  return NextResponse.json({ success: true });
}
