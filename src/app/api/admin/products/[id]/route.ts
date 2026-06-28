export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { readJson, writeJson } from '@/lib/jsonDb';

type Params = { params: Promise<{ id: string }> };

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  const updated = await req.json();
  const products = await readJson<Record<string, unknown>[]>('products.json');
  const idx = products.findIndex((p) => String(p.id) === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  products[idx] = { ...products[idx], ...updated };
  await writeJson('products.json', products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  const products = await readJson<Record<string, unknown>[]>('products.json');
  await writeJson('products.json', products.filter((p) => String(p.id) !== id));
  return NextResponse.json({ success: true });
}
