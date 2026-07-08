export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listProducts, createProduct } from '@/lib/db';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(await listProducts());
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const payload = await req.json();
  const product = await createProduct(payload);
  return NextResponse.json(product);
}
