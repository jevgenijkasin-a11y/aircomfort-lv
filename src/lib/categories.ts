// Category tree shared by server and client code (pure helpers, no DB access).
//
// `products.category` stores a category `key`. The four original categories
// are "system" categories: their key and slug are fixed (existing URLs under
// /catalog/type/* and code that checks e.g. `category === 'home'` rely on them)
// and their public names come from the site texts. Categories created later
// (e.g. fan coils) are fully managed in the admin panel.

export type Loc = 'lv' | 'ru' | 'en';

export interface Category {
  key: string;
  parent_key: string | null;
  slug: string;
  name_lv: string;
  name_ru: string;
  name_en: string;
  sort_order: number;
  is_visible: boolean;
  is_system: boolean;
  image_url: string;
  seo_title_lv: string; seo_title_ru: string; seo_title_en: string;
  seo_description_lv: string; seo_description_ru: string; seo_description_en: string;
  seo_h1_lv: string; seo_h1_ru: string; seo_h1_en: string;
  seo_intro_lv: string; seo_intro_ru: string; seo_intro_en: string;
}

/** Fan coil parent category; its subcategories share the fan coil fields. */
export const FAN_COILS_KEY = 'fan_coils';
export const FAN_COILS_DUCTED_KEY = 'fan_coils_ducted';
/** Air-to-water heat pumps — the natural partner of fan coils. */
export const AIR_WATER_KEY = 'commercial_heat_pump';

export const catName = (c: Category, l: Loc) => c[`name_${l}`] || c.name_ru || c.name_lv || c.name_en || c.key;

export const byKey = (cats: Category[]) => new Map(cats.map((c) => [c.key, c]));

/** The key itself plus all descendant keys. */
export function descendantKeys(cats: Category[], key: string): Set<string> {
  const out = new Set([key]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of cats) {
      if (c.parent_key && out.has(c.parent_key) && !out.has(c.key)) { out.add(c.key); grew = true; }
    }
  }
  return out;
}

/** True if `key` is `ancestor` or one of its descendants. */
export function isWithin(cats: Category[], key: string, ancestor: string): boolean {
  const map = byKey(cats);
  let cur: string | null | undefined = key;
  for (let i = 0; cur && i < 10; i++) {
    if (cur === ancestor) return true;
    cur = map.get(cur)?.parent_key;
  }
  return false;
}

export const isFanCoil = (cats: Category[], key: string) => isWithin(cats, key, FAN_COILS_KEY);

/** Roots with their children, both sorted — for grouped selects and the admin tree. */
export function categoryTree(cats: Category[]): { cat: Category; children: Category[] }[] {
  const sort = (a: Category, b: Category) => a.sort_order - b.sort_order || a.key.localeCompare(b.key);
  const keys = new Set(cats.map((c) => c.key));
  return cats
    .filter((c) => !c.parent_key || !keys.has(c.parent_key))
    .sort(sort)
    .map((cat) => ({ cat, children: cats.filter((c) => c.parent_key === cat.key).sort(sort) }));
}

/** Keys of categories hidden on the site (a hidden parent hides its children). */
export function hiddenKeys(cats: Category[]): Set<string> {
  const out = new Set<string>();
  for (const c of cats) if (!c.is_visible) descendantKeys(cats, c.key).forEach((k) => out.add(k));
  return out;
}

/** "fan-coils-ducted" style slug from any text (Latvian/Russian letters transliterated). */
export function slugify(s: string): string {
  const map: Record<string, string> = {
    ā: 'a', č: 'c', ē: 'e', ģ: 'g', ī: 'i', ķ: 'k', ļ: 'l', ņ: 'n', š: 's', ū: 'u', ž: 'z',
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return s.toLowerCase().split('').map((ch) => map[ch] ?? ch).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
