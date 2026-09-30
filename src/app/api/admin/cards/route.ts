export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listCards, createCard } from '@/lib/db';
import { cardSlugError, cardDbError } from '@/lib/cardSlug';

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await listCards());
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const slugError = cardSlugError(body, true);
  if (slugError) return NextResponse.json({ error: slugError }, { status: 400 });
  try {
    await createCard({ ...body, slug: String(body.slug).trim() });
  } catch (e) {
    return NextResponse.json({ error: cardDbError(e) }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
