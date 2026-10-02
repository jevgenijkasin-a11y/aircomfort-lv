// IndexNow after a product save: report the product page (lv/ru/en) when it is
// public — in stock, category not hidden, not a hidden duplicate.
import type { SupabaseProduct } from './types';
import { hiddenCategoryKeys } from './db';
import { DUPLICATE_REDIRECTS } from './catalogData';
import { localizedUrls, notifyIndexNow } from './indexNow';

export function notifyProductSaved(p: SupabaseProduct | null, reqHost: string | null): void {
  try {
    if (!p || !p.in_stock || DUPLICATE_REDIRECTS[p.id] || hiddenCategoryKeys().has(p.category)) return;
    notifyIndexNow(localizedUrls(`/catalog/${p.id}`), reqHost);
  } catch (e) {
    console.error('[indexnow] product:', (e as Error).message);
  }
}
