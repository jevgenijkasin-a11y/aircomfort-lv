// Catalog filtering shared by the server page (page count, 404 for pages out
// of range) and the client component, so both always agree.
import type { SupabaseProduct } from './types';
import { areaMax } from './productSeo';
import { type Category, descendantKeys, isFanCoil } from './categories';
import { inKwRange, fanSpec } from './fanCoil';

export type Filters = {
  brand?: string; area?: string; category?: string; sort?: string; q?: string;
  pipes?: string; motor?: string; cool?: string; heat?: string;
};
export const FILTER_KEYS = ['brand', 'q', 'area', 'category', 'pipes', 'motor', 'cool', 'heat', 'sort'] as const;
/** Filters that only apply inside the fan coil category. */
export const FAN_FILTER_KEYS = ['pipes', 'motor', 'cool', 'heat'] as const;

/** Room-area buckets (m², by the product's max served area). */
export const AREA_BUCKETS: { id: string; min: number; max: number; label: string }[] = [
  { id: 'lt25', min: 0, max: 25, label: '≤ 25 m²' },
  { id: '25-35', min: 25, max: 35, label: '25–35 m²' },
  { id: '35-50', min: 35, max: 50, label: '35–50 m²' },
  { id: '50-70', min: 50, max: 70, label: '50–70 m²' },
  { id: '70plus', min: 70, max: Infinity, label: '70+ m²' },
];
const inBucket = (p: SupabaseProduct, id: string) => {
  const b = AREA_BUCKETS.find((x) => x.id === id);
  const a = areaMax(p);
  if (!b || a === null) return false;
  return b.id === 'lt25' ? a <= 25 : a > b.min && a <= b.max;
};

// Case- and diacritic-insensitive ("kondicionetajs" finds "kondicionētājs")
export const norm = (s: string) => s.toLocaleLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const finalPrice = (p: SupabaseProduct) => (p.price ? (p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price) : 0);

/** Picks known filter params from search params (unknown/empty values dropped). */
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const out: Filters = {};
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    const s = (Array.isArray(v) ? v[0] : v)?.trim();
    if (s) out[k] = s.slice(0, 100);
  }
  return out;
}

export const hasFilters = (f: Filters) => FILTER_KEYS.some((k) => k !== 'sort' && !!f[k]) || (!!f.sort && f.sort !== 'asc');

/** Fan coil filters are only active while a fan coil category is selected. */
export const fanFiltersActive = (f: Filters, cats: Category[]) => !!f.category && isFanCoil(cats, f.category);

export function filterProducts(all: SupabaseProduct[], f: Filters, cats: Category[]): SupabaseProduct[] {
  let list = [...all];
  if (f.brand) list = list.filter((p) => p.brand === f.brand);
  if (f.area) list = list.filter((p) => inBucket(p, f.area!));
  if (f.q) {
    const needle = norm(f.q);
    list = list.filter((p) => norm([p.brand, p.name_lv, p.name_ru, p.name_en].join(' ')).includes(needle));
  }
  if (f.category) {
    const keys = descendantKeys(cats, f.category);
    list = list.filter((p) => keys.has(p.category));
  }
  if (fanFiltersActive(f, cats)) {
    if (f.pipes) list = list.filter((p) => fanSpec(p, 'pipe_system') === f.pipes);
    if (f.motor) list = list.filter((p) => fanSpec(p, 'fan_motor') === f.motor);
    if (f.cool) list = list.filter((p) => inKwRange(fanSpec(p, 'cooling_kw'), f.cool!));
    if (f.heat) list = list.filter((p) => inKwRange(fanSpec(p, 'heating_kw'), f.heat!));
  }
  const desc = f.sort === 'desc';
  // 'Price on request' (no price) always last, whatever the direction
  list.sort((a, b) => {
    const pa = finalPrice(a), pb = finalPrice(b);
    if (!pa || !pb) return (pa ? 0 : 1) - (pb ? 0 : 1);
    return desc ? pb - pa : pa - pb;
  });
  return list;
}

/** "?brand=LG&page=2" style query (page omitted when 1), in a stable order. */
export function filtersQuery(f: Filters, page = 1, cats: Category[] = []): string {
  const p = new URLSearchParams();
  const fan = fanFiltersActive(f, cats);
  for (const k of FILTER_KEYS) {
    const v = f[k];
    if (!v || (k === 'sort' && v === 'asc')) continue;
    if ((FAN_FILTER_KEYS as readonly string[]).includes(k) && !fan) continue;
    p.set(k, v);
  }
  if (page > 1) p.set('page', String(page));
  return p.toString();
}
