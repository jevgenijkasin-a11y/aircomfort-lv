// Per-language sitemap: /sitemaps/lv.xml, /sitemaps/ru.xml, /sitemaps/en.xml
export const dynamic = 'force-dynamic';

import { SITEMAP_LOCALES, sitemapEntries, urlsetXml, XML_HEADERS } from '@/lib/sitemapData';

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const locale = file.replace(/\.xml$/, '');
  if (!file.endsWith('.xml') || !(SITEMAP_LOCALES as readonly string[]).includes(locale)) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(urlsetXml(await sitemapEntries(locale)), { headers: XML_HEADERS });
}
