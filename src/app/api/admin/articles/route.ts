export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listArticles, createArticle } from '@/lib/db';
import { validateArticle, articleDbError } from '@/lib/articles';
import { articleIndexNowUrls } from '@/lib/articleIndexNow';
import { notifyIndexNow, requestHost } from '@/lib/indexNow';

const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(listArticles());
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { data, errors } = validateArticle(await req.json(), true);
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  try {
    const article = createArticle(data);
    notifyIndexNow(articleIndexNowUrls(null, article), requestHost(req));
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: articleDbError(e), errors: [articleDbError(e)] }, { status: 400 });
  }
}
