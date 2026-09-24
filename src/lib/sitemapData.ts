import { listProducts } from './db';
import { visibleProducts } from './catalogData';
import { BASE_URL } from './seo';
import { brandSlug, CATEGORY_SLUGS } from './productSeo';

export const SITEMAP_LOCALES = ['lv', 'ru', 'en'] as const;

/**
 * Real last-change dates of static page content (from git history of the
 * page/components). Update the date when the page content changes.
 */
const STATIC_PAGES: { path: string; lastmod: string; priority: number; changefreq: string }[] = [
  { path: '', lastmod: '2026-07-08', priority: 1.0, changefreq: 'weekly' },
  { path: '/calculator', lastmod: '2026-07-20', priority: 0.7, changefreq: 'monthly' },
  { path: '/contacts', lastmod: '2026-07-20', priority: 0.7, changefreq: 'monthly' },
  { path: '/privacy', lastmod: '2026-05-13', priority: 0.3, changefreq: 'yearly' },
];

type Entry = { loc: string; lastmod: string; priority: number; changefreq: string };

const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : undefined);
const maxDate = (dates: (string | undefined)[]) => dates.filter(Boolean).sort().at(-1) ?? '2026-07-08';

/** All canonical, indexable URLs for one locale. */
export async function sitemapEntries(locale: string): Promise<Entry[]> {
  const products = visibleProducts(await listProducts({ inStockOnly: true }));
  const pDate = (p: (typeof products)[number]) => day(p.updated_at) ?? day(p.created_at)!;
  const base = `${BASE_URL}/${locale}`;
  const out: Entry[] = STATIC_PAGES.map((s) => ({ loc: `${base}${s.path}`, lastmod: s.lastmod, priority: s.priority, changefreq: s.changefreq }));

  // Catalog: changes whenever any product changes
  out.push({ loc: `${base}/catalog`, lastmod: maxDate(products.map(pDate)), priority: 0.9, changefreq: 'weekly' });

  // Brand landings
  const byBrand = new Map<string, typeof products>();
  for (const p of products) byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p]);
  for (const [brand, list] of byBrand) {
    out.push({ loc: `${base}/catalog/brand/${brandSlug(brand)}`, lastmod: maxDate(list.map(pDate)), priority: 0.8, changefreq: 'weekly' });
  }
  // Category landings
  for (const [cat, slug] of Object.entries(CATEGORY_SLUGS)) {
    const list = products.filter((p) => p.category === cat);
    if (list.length) out.push({ loc: `${base}/catalog/type/${slug}`, lastmod: maxDate(list.map(pDate)), priority: 0.8, changefreq: 'weekly' });
  }
  // Products
  for (const p of products) {
    out.push({ loc: `${base}/catalog/${p.id}`, lastmod: pDate(p), priority: 0.6, changefreq: 'monthly' });
  }
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function urlsetXml(entries: Entry[]): string {
  const body = entries
    .map((e) => `<url><loc>${esc(e.loc)}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function indexXml(items: { loc: string; lastmod: string }[]): string {
  const body = items.map((i) => `<sitemap><loc>${esc(i.loc)}</loc><lastmod>${i.lastmod}</lastmod></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export const XML_HEADERS = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' };
