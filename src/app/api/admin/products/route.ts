export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listProducts, createProduct } from '@/lib/db';
import { validateProductPayload } from '@/lib/productValidation';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(await listProducts());
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { payload, errors } = await validateProductPayload(await req.json());
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  const product = await createProduct(payload);
  return NextResponse.json(product);
}
