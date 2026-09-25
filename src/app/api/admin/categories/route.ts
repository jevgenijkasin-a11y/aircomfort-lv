export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listCategories, categoryProductCounts, createCategory } from '@/lib/db';
import { validateCategory } from '@/lib/categoryValidation';

const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json({ categories: listCategories(), counts: categoryProductCounts() });
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const body = await req.json();
  const { patch, key, errors } = validateCategory(body, listCategories(), null);
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  return NextResponse.json(createCategory(key, patch));
}
