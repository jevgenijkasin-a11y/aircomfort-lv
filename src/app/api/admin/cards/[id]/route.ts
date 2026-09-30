export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { updateCard, deleteCard } from '@/lib/db';
import { cardSlugError, cardDbError } from '@/lib/cardSlug';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const slugError = cardSlugError(body, false);
  if (slugError) return NextResponse.json({ error: slugError }, { status: 400 });
  try {
    await updateCard(id, 'slug' in body ? { ...body, slug: String(body.slug).trim() } : body);
  } catch (e) {
    return NextResponse.json({ error: cardDbError(e) }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await deleteCard(id);
  return NextResponse.json({ ok: true });
}
