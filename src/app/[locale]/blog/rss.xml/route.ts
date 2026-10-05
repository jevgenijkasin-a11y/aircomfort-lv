// Blog RSS feed per language: /lv/blog/rss.xml, /ru/blog/rss.xml, /en/blog/rss.xml
export const dynamic = 'force-dynamic';

import { rssXml, RSS_HEADERS } from '@/lib/aiFeeds';
import { ARTICLE_LOCALES, type Loc } from '@/lib/articles';

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(ARTICLE_LOCALES as string[]).includes(locale)) return new Response('Not found', { status: 404 });
  return new Response(await rssXml(locale as Loc), { headers: RSS_HEADERS });
}
