import type { SupabaseProduct } from './types';

/** Products per catalog page (server pagination with real ?page=N links). */
export const CATALOG_PAGE_SIZE = 24;

/**
 * Duplicate products hidden from listings/sitemap and 301-redirected to the
 * original: { duplicateId: originalId }. Hiding is done in code so the live
 * database on the server is never modified.
 */
export const DUPLICATE_REDIRECTS: Record<string, string> = {};

/** Products that should appear in listings, landing pages and the sitemap. */
export const visibleProducts = (all: SupabaseProduct[]) =>
  all.filter((p) => !DUPLICATE_REDIRECTS[p.id]);
