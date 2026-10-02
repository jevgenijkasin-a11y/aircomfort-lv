export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { getArticle, updateArticle, deleteArticle } from '@/lib/db';
import { validateArticle, articleDbError } from '@/lib/articles';
import { articleIndexNowUrls } from '@/lib/articleIndexNow';
import { notifyIndexNow, requestHost } from '@/lib/indexNow';

type Params = { params: Promise<{ id: string }> };

const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const article = getArticle(Number((await params).id));
  return article ? NextResponse.json(article) : notFound();
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const id = Number((await params).id);
  const before = getArticle(id);
  if (!before) return notFound();
  const { data, errors } = validateArticle(await req.json(), false);
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  try {
    const article = updateArticle(id, data);
    notifyIndexNow(articleIndexNowUrls(before, article), requestHost(req));
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: articleDbError(e), errors: [articleDbError(e)] }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const id = Number((await params).id);
  const before = getArticle(id);
  deleteArticle(id);
  notifyIndexNow(articleIndexNowUrls(before, null), requestHost(req));
  return NextResponse.json({ success: true });
}
