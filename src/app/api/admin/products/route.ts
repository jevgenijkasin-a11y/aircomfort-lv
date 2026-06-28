export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { readJson, writeJson } from '@/lib/jsonDb';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const data = await readJson<unknown[]>('products.json');
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const product = await req.json();
  const products = await readJson<unknown[]>('products.json');
  const newProduct = { ...product, id: Date.now() };
  products.push(newProduct);
  await writeJson('products.json', products);
  return NextResponse.json(newProduct);
}
