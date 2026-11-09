// Readable product addresses: /[lang]/catalog/p/<slug>, e.g.
// /lv/catalog/p/hava-smart-plus-5-3-kw. One slug for all languages, built from
// the English name (brand + model + capacity). Pure helpers, safe on the client.

export const PRODUCT_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PRODUCT_SLUG_MAX = 90;

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ß: 'ss', æ: 'ae', ø: 'o', œ: 'oe', ł: 'l', đ: 'd',
};

/**
 * "HAVA Smart Plus 5.3 kW" → "hava-smart-plus-5-3-kw". Diacritics dropped
 * (ā→a, š→s), Cyrillic transliterated, brackets / slashes / other signs become
 * hyphens; cut at a hyphen when longer than PRODUCT_SLUG_MAX.
 */
export function slugText(s: string): string {
  const base = s
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .split('').map((ch) => TRANSLIT[ch] ?? ch).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= PRODUCT_SLUG_MAX) return base;
  const cut = base.slice(0, PRODUCT_SLUG_MAX);
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : PRODUCT_SLUG_MAX).replace(/-+$/, '');
}

/** "/catalog/p/<slug>" (path after the locale). Without a slug yet, the id works too (it redirects). */
export const productPath = (p: { id: string; slug?: string | null }) => `/catalog/p/${p.slug || p.id}`;

/** Product ids are UUIDs (old addresses /catalog/<uuid>). */
export const PRODUCT_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
