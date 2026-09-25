import type { SupabaseProduct } from './types';

/** Products per catalog page (server pagination with real ?page=N links). */
export const CATALOG_PAGE_SIZE = 24;

/**
 * Duplicate products hidden from listings/sitemap and 301-redirected to the
 * original: { duplicateId: originalId }. Hiding is done in code so the live
 * database on the server is never modified.
 */
export const DUPLICATE_REDIRECTS: Record<string, string> = {
  // Hisense Hi-Smart CF25LB02 (kopija) -> Hisense Hi-Smart CF25LB02 (identical data)
  '1719d7c0-0070-473d-907f-7e7d542eafba': '76662679-b614-4719-a279-49bb3f67acc8',
};

/**
 * Products that should appear in listings, landing pages and the sitemap.
 * `hidden` = category keys switched off in Admin → Categories.
 */
export const visibleProducts = (all: SupabaseProduct[], hidden: Set<string> = new Set()) =>
  all.filter((p) => !DUPLICATE_REDIRECTS[p.id] && !hidden.has(p.category));
