// Server-side data for the public blog pages and the sitemap.
import type { Metadata } from 'next';
import { listArticles, getArticleBySlug, listProducts, listCategories, hiddenCategoryKeys } from './db';
import { type Article, type Loc, hasLocale, articleLocales } from './articles';
import { visibleProducts } from './catalogData';
import { brandSlug } from './productSeo';
import { descendantKeys, categoryBySegments, categoryPath, currentCatalogPath } from './categories';
import { BASE_URL } from './seo';
import type { SupabaseProduct } from './types';

export const asLoc = (l: string): Loc => (l === 'ru' || l === 'en' ? l : 'lv');

/** Published articles that have a version in this language, newest first. */
export const publishedArticles = (locale: string) =>
  listArticles({ publishedOnly: true }).filter((a) => hasLocale(a, asLoc(locale)));

/** The article as shown publicly: published and translated, otherwise null (→ 404). */
export function publicArticle(slug: string, locale: string): Article | null {
  const a = getArticleBySlug(slug);
  return a && a.is_published && hasLocale(a, asLoc(locale)) ? a : null;
}

/** Products of a catalog section path (/catalog, /catalog/<slug>, /catalog/<parent>/<sub>, /catalog/brand/x; old /catalog/type/x too). */
function productsOfPath(all: SupabaseProduct[], path: string): SupabaseProduct[] {
  const cats = listCategories();
  const [, , ...segments] = currentCatalogPath(cats, path).split('/'); // ['', 'catalog', ...]
  if (!segments.length) return all;
  if (segments[0] === 'brand') return all.filter((p) => brandSlug(p.brand) === segments[1]);
  const cat = categoryBySegments(cats, segments);
  if (!cat) return [];
  const keys = descendantKeys(cats, cat.key);
  return all.filter((p) => keys.has(p.category));
}

/** The article's catalog section as a current URL (old /catalog/type/x links are mapped). */
export const articleCatalogPath = (a: Article) => (a.related_catalog ? currentCatalogPath(listCategories(), a.related_catalog) : '');

/**
 * "Suitable equipment": the products picked in the admin (in stock and
 * public), otherwise up to 4 from the linked catalog section — hits and
 * promos first, then the cheapest.
 */
export async function relatedProducts(a: Article, n = 4): Promise<SupabaseProduct[]> {
  const all = visibleProducts(await listProducts({ inStockOnly: true, orderBy: 'price' }), hiddenCategoryKeys());
  if (a.related_product_ids.length) {
    const byId = new Map(all.map((p) => [p.id, p]));
    const picked = a.related_product_ids.map((id) => byId.get(id)).filter((p): p is SupabaseProduct => !!p);
    if (picked.length) return picked;
  }
  if (!a.related_catalog) return [];
  const rank = (p: SupabaseProduct) => (p.is_hit ? 0 : p.is_promo ? 1 : 2);
  return productsOfPath(all, a.related_catalog)
    .map((p, i) => ({ p, i }))
    .sort((x, y) => rank(x.p) - rank(y.p) || x.i - y.i)
    .slice(0, n)
    .map((x) => x.p);
}

// Product category → article topics that fit it (points)
const TOPIC_FIT: Record<string, Partial<Record<Article['category'], number>>> = {
  home: { cooling: 2 },
  heat_pump: { heating: 2, cooling: 1 },
  commercial: { cooling: 2 },
  commercial_heat_pump: { heating: 2, subsidy: 1 },
  fan_coils: { heating: 2 },
};

/**
 * "Useful articles" for a product page: published articles in this language,
 * best first — linked to the product's catalog section (+3), topic fit
 * (+1…2); topped up with the latest articles so the block has `n` items.
 */
export function articlesForProduct(p: SupabaseProduct, locale: string, n = 2): Article[] {
  const list = publishedArticles(locale);
  const topicKey = p.category.startsWith('fan_coils') ? 'fan_coils' : p.category;
  const cats = listCategories();
  const ownPaths = new Set(
    topicKey === 'fan_coils'
      ? cats.filter((c) => c.key.startsWith('fan_coils')).map((c) => categoryPath(cats, c.key))
      : [categoryPath(cats, p.category)],
  );
  const score = (a: Article) => (ownPaths.has(articleCatalogPath(a)) ? 3 : 0) + (TOPIC_FIT[topicKey]?.[a.category] ?? 0);
  return list
    .map((a, i) => ({ a, s: score(a), i }))
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .slice(0, n)
    .map((x) => x.a);
}

/** canonical + hreflang between the article's languages only. */
export function articleAlternates(a: Article, locale: string): NonNullable<Metadata['alternates']> {
  const locales = articleLocales(a);
  const url = (l: string) => `${BASE_URL}/${l}/blog/${a.slug}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = url(l);
  languages['x-default'] = url(locales.includes('lv') ? 'lv' : locales[0]);
  return { canonical: url(locale), languages };
}

/** Article date for JSON-LD and Open Graph (not shown to visitors): first publication, else creation. */
export const publishedDate = (a: Article) => a.published_at ?? a.created_at;

/**
 * Links inside article texts that still point to old category addresses
 * (/lv/catalog/type/x, /catalog/category/x) are rewritten to /lv/catalog/x,
 * so readers and crawlers go straight to the page without a redirect.
 */
export function currentCatalogLinks(html: string): string {
  const cats = listCategories();
  return html.replace(/href="(\/(?:lv|ru|en))?(\/catalog\/(?:type|category)\/[a-z0-9-]+)\/?"/g, (_m, loc: string | undefined, path: string) =>
    `href="${loc ?? ''}${currentCatalogPath(cats, path)}"`);
}
