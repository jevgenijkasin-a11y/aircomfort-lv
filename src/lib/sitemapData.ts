import { listProducts, hiddenCategoryKeys, listCategories, listServices } from './db';
import { descendantKeys, hiddenKeys, categoryPath } from './categories';
import { visibleProducts } from './catalogData';
import { BASE_URL } from './seo';
import { brandSlug, absUrl } from './productSeo';
import { SERVICES_HUB, servicePath } from './services';
import { productImages } from './types';
import { publishedArticles } from './blogData';

export const SITEMAP_LOCALES = ['lv', 'ru', 'en'] as const;

/** Static pages: their lastmod is the date of the deployed build (set in next.config.js). */
const STATIC_PAGES: { path: string; priority: number; changefreq: string }[] = [
  { path: '', priority: 1.0, changefreq: 'weekly' },
  { path: '/calculator', priority: 0.7, changefreq: 'monthly' },
  { path: '/contacts', priority: 0.7, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
];

/** images: absolute photo URLs of the page (Google image sitemap extension). */
// isStatic: a page without DB content (its date is the build date, not counted in the index)
type Entry = { loc: string; lastmod?: string; priority: number; changefreq: string; images?: string[]; isStatic?: true };

/** Pictures used in an article: cover + markdown images. */
const articleImages = (cover: string, body: string) =>
  Array.from(new Set([cover, ...Array.from(body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g), (m) => m[1])].filter((u) => u && (u.startsWith('/') || u.startsWith('http'))))).map(absUrl);

/**
 * W3C datetime (ISO 8601, UTC, whole seconds) of a DB timestamp, never in
 * the future. Timestamps are stored in several ISO forms
 * ('2026-05-22T08:42:15.195299+00:00', '2026-10-02T14:16:05.113Z').
 */
export function lastmod(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  // microseconds → milliseconds; a space instead of "T" is also accepted
  let t = Date.parse(iso.trim().replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1'));
  if (Number.isNaN(t)) return undefined;
  t = Math.min(t, Date.now());
  return new Date(t).toISOString().replace(/\.\d{3}Z$/, 'Z');
}
/** Latest of the dates (all are UTC ISO strings, so they sort as text). */
export const maxDate = (dates: (string | undefined)[]) => dates.filter((d): d is string => !!d).sort().at(-1);
/** When the deployed build was made — lastmod of the static pages. */
const BUILD_TIME = lastmod(process.env.BUILD_TIME) ?? lastmod(new Date().toISOString())!;

/** All canonical, indexable URLs for one locale. */
export async function sitemapEntries(locale: string): Promise<Entry[]> {
  const products = visibleProducts(await listProducts({ inStockOnly: true }), hiddenCategoryKeys());
  const pDate = (p: (typeof products)[number]) => lastmod(p.updated_at) ?? lastmod(p.created_at);
  const base = `${BASE_URL}/${locale}`;
  const out: Entry[] = STATIC_PAGES.map((s) => ({ loc: `${base}${s.path}`, lastmod: BUILD_TIME, priority: s.priority, changefreq: s.changefreq, isStatic: true }));

  // Catalog: changes whenever any product changes
  out.push({ loc: `${base}/catalog`, lastmod: maxDate(products.map(pDate)), priority: 0.9, changefreq: 'weekly' });

  // Brand landings
  const byBrand = new Map<string, typeof products>();
  for (const p of products) byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p]);
  for (const [brand, list] of byBrand) {
    out.push({ loc: `${base}/catalog/brand/${brandSlug(brand)}`, lastmod: maxDate(list.map(pDate)), priority: 0.8, changefreq: 'weekly' });
  }
  // Category pages /catalog/<slug> (+ /catalog/<parent>/<sub>): visible and not empty
  // (empty ones are noindex, so they stay out of the sitemap); lastmod = newest of their products
  const cats = listCategories();
  const hidden = hiddenKeys(cats);
  for (const c of cats) {
    if (hidden.has(c.key)) continue;
    const keys = descendantKeys(cats, c.key);
    const list = products.filter((p) => keys.has(p.category));
    if (list.length) out.push({ loc: `${base}${categoryPath(cats, c.key)}`, lastmod: maxDate(list.map(pDate)), priority: 0.8, changefreq: 'weekly' });
  }
  // Service pages (drafts are left out) and their hub
  const services = listServices({ publicOnly: true });
  if (services.length) {
    out.push({ loc: `${base}${SERVICES_HUB}`, lastmod: maxDate(services.map((s) => lastmod(s.updated_at))), priority: 0.8, changefreq: 'monthly' });
    for (const s of services) {
      out.push({ loc: `${base}${servicePath(s.slug)}`, lastmod: lastmod(s.updated_at), priority: 0.8, changefreq: 'monthly' });
    }
  }
  // Products
  for (const p of products) {
    out.push({ loc: `${base}/catalog/${p.id}`, lastmod: pDate(p), priority: 0.6, changefreq: 'monthly', images: productImages(p).map(absUrl) });
  }
  // Blog: published articles that exist in this language (drafts never listed)
  const articles = publishedArticles(locale);
  if (articles.length) {
    out.push({ loc: `${base}/blog`, lastmod: maxDate(articles.map((a) => lastmod(a.updated_at))), priority: 0.6, changefreq: 'weekly' });
    for (const a of articles) {
      out.push({ loc: `${base}/blog/${a.slug}`, lastmod: lastmod(a.updated_at), priority: 0.7, changefreq: 'monthly', images: articleImages(a.cover_url, a[`body_${locale as 'lv' | 'ru' | 'en'}`]) });
    }
  }
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function urlsetXml(entries: Entry[]): string {
  const body = entries
    .map((e) => `<url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority>${(e.images ?? []).map((u) => `<image:image><image:loc>${esc(u)}</image:loc></image:image>`).join('')}</url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

export function indexXml(items: { loc: string; lastmod?: string }[]): string {
  const body = items.map((i) => `<sitemap><loc>${esc(i.loc)}</loc>${i.lastmod ? `<lastmod>${i.lastmod}</lastmod>` : ''}</sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export const XML_HEADERS = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' };
