// Sitemap index: one child sitemap per language (~480 URLs each).
export const dynamic = 'force-dynamic';

import { BASE_URL } from '@/lib/seo';
import { SITEMAP_LOCALES, sitemapEntries, indexXml, XML_HEADERS } from '@/lib/sitemapData';

export async function GET() {
  const items = await Promise.all(
    SITEMAP_LOCALES.map(async (l) => {
      const entries = await sitemapEntries(l);
      return { loc: `${BASE_URL}/sitemaps/${l}.xml`, lastmod: entries.map((e) => e.lastmod).sort().at(-1)! };
    })
  );
  return new Response(indexXml(items), { headers: XML_HEADERS });
}
