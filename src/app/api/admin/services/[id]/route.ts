export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { updateService } from '@/lib/db';
import { validateService } from '@/lib/services';

type Params = { params: Promise<{ id: string }> };
const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  const { data, errors } = validateService(await req.json());
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  const s = updateService(Number(id), data);
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(s);
}
