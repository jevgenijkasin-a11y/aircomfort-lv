export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listArticles, reorderArticles } from '@/lib/db';

const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/** PUT { ids: number[] } — the new order of all articles, first = shown first. */
export async function PUT(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const body = await req.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter((n: number) => Number.isInteger(n) && n > 0) : [];
  const known = new Set(listArticles().map((a) => a.id));
  if (!ids.length || ids.length !== new Set(ids).size || ids.some((id: number) => !known.has(id))) {
    return NextResponse.json({ error: 'Неверный список статей для сортировки.' }, { status: 400 });
  }
  reorderArticles(ids);
  return NextResponse.json(listArticles());
}
