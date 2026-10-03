// Server pagination for product listings (catalog, category and brand pages):
// 24 products per page, real ?page=N URLs, self-canonical pages.
import type { Metadata } from 'next';
import { CATALOG_PAGE_SIZE } from './catalogData';
import { BASE_URL, localizedAlternates } from './seo';
import type { Loc } from './productSeo';

export const PAGE_WORD: Record<Loc, string> = { lv: 'lapa', ru: 'страница', en: 'page' };

type SP = Record<string, string | string[] | undefined>;

/** ?page=N → N (1 for missing / invalid / 1). */
export const parsePage = (v?: string | string[]) => {
  const n = parseInt((Array.isArray(v) ? v[0] : v) || '1', 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
};
export const pageFromSearch = (sp: SP) => parsePage(sp.page);

export function paginate<T>(list: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(list.length / CATALOG_PAGE_SIZE));
  const offset = (page - 1) * CATALOG_PAGE_SIZE;
  return { items: list.slice(offset, offset + CATALOG_PAGE_SIZE), totalPages, offset };
}

export type PageItem = { n: number; compact: boolean } | { gap: true };

/**
 * Page numbers for the pager. All numbers stay in the HTML (crawlable); on
 * phones only `compact` ones are shown — 1 2 3, the current page with its
 * neighbours and the last page — with "…" (gap, phones only) between groups.
 */
export function pageItems(page: number, total: number): PageItem[] {
  const keep = new Set([1, 2, 3, page - 1, page, page + 1, total].filter((n) => n >= 1 && n <= total));
  const out: PageItem[] = [];
  for (let n = 1; n <= total; n++) {
    const compact = keep.has(n);
    if (!compact && keep.has(n - 1)) out.push({ gap: true });
    out.push({ n, compact });
  }
  return out;
}

/** "/catalog/type/x" + page → "/catalog/type/x?page=2" (page 1 = clean path). */
export const pagePath = (base: string, page: number) => (page > 1 ? `${base}?page=${page}` : base);

/** " — lapa 2" suffix for titles / H1 on pages after the first. */
export const pageSuffix = (page: number, l: Loc) => (page > 1 ? ` — ${PAGE_WORD[l]} ${page}` : '');

/**
 * Canonical (self, incl. ?page=N) + hreflang, and Open Graph / Twitter with
 * the same title and description as the page.
 */
export function listingMetadata(opts: { locale: string; path: string; title: string; description: string }): Metadata {
  const { locale, path, title, description } = opts;
  const full = `${title} | AirComfort`;
  return {
    title,
    description: description || undefined,
    alternates: localizedAlternates(locale, path),
    ...socialMeta(locale, path, full, description),
  };
}

/** og:* / twitter:* equal to the page's own title and description. */
export function socialMeta(locale: string, path: string, fullTitle: string, description: string): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}${path}`,
      title: fullTitle,
      description: description || undefined,
      siteName: 'AirComfort',
      locale: { lv: 'lv_LV', ru: 'ru_RU', en: 'en_US' }[locale] ?? 'lv_LV',
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: description || undefined },
  };
}

/** schema.org ItemList of the products shown on this page (in stock only). */
export function itemListJsonLd(locale: string, items: { id: string; name: string }[], offset: number, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: offset + i + 1,
      url: `${BASE_URL}/${locale}/catalog/${p.id}`,
      name: p.name,
    })),
  };
}
