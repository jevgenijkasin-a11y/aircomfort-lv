// Sitemap index: one child sitemap per language (~480 URLs each).
export const dynamic = 'force-dynamic';

import { BASE_URL } from '@/lib/seo';
import { SITEMAP_LOCALES, sitemapEntries, indexXml, maxDate, XML_HEADERS } from '@/lib/sitemapData';

export async function GET() {
  const items = await Promise.all(
    SITEMAP_LOCALES.map(async (l) => {
      // lastmod = the newest product / article change in that sitemap (static pages carry the build date, not counted)
      const entries = (await sitemapEntries(l)).filter((e) => !e.isStatic);
      return { loc: `${BASE_URL}/sitemaps/${l}.xml`, lastmod: maxDate(entries.map((e) => e.lastmod)) };
    })
  );
  return new Response(indexXml(items), { headers: XML_HEADERS });
}
