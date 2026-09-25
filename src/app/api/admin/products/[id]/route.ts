export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { updateProduct, deleteProduct } from '@/lib/db';
import { validateProductPayload } from '@/lib/productValidation';

type Params = { params: Promise<{ id: string }> };

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  const { payload, errors } = await validateProductPayload(await req.json(), id);
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  const product = await updateProduct(id, payload);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
