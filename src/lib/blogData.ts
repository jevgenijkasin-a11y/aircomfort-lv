// Server-side data for the public blog pages and the sitemap.
import type { Metadata } from 'next';
import { listArticles, getArticleBySlug, listProducts, listCategories, hiddenCategoryKeys } from './db';
import { type Article, type Loc, hasLocale, articleLocales } from './articles';
import { visibleProducts } from './catalogData';
import { brandSlug, categoryFromSlug } from './productSeo';
import { descendantKeys } from './categories';
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

/** Products of a catalog section path (/catalog, /catalog/type/x, /catalog/category/x, /catalog/brand/x). */
function productsOfPath(all: SupabaseProduct[], path: string): SupabaseProduct[] {
  const [, , kind, slug] = path.split('/'); // ['', 'catalog', kind, slug]
  if (!kind) return all;
  if (kind === 'brand') return all.filter((p) => brandSlug(p.brand) === slug);
  const cats = listCategories();
  const key = kind === 'type' ? categoryFromSlug(slug) : kind === 'category' ? cats.find((c) => c.slug === slug)?.key : null;
  if (!key) return [];
  const keys = descendantKeys(cats, key);
  return all.filter((p) => keys.has(p.category));
}

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

/** canonical + hreflang between the article's languages only. */
export function articleAlternates(a: Article, locale: string): NonNullable<Metadata['alternates']> {
  const locales = articleLocales(a);
  const url = (l: string) => `${BASE_URL}/${l}/blog/${a.slug}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = url(l);
  languages['x-default'] = url(locales.includes('lv') ? 'lv' : locales[0]);
  return { canonical: url(locale), languages };
}

const DATE_LOCALE: Record<Loc, string> = { lv: 'lv-LV', ru: 'ru-RU', en: 'en-GB' };
export const formatDate = (iso: string | null | undefined, locale: string) =>
  iso ? new Intl.DateTimeFormat(DATE_LOCALE[asLoc(locale)], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Riga' }).format(new Date(iso)) : '';

/** Article date shown and used in JSON-LD: first publication, else creation. */
export const publishedDate = (a: Article) => a.published_at ?? a.created_at;
