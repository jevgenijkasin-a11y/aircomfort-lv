import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side / admin panel client (normal caching)
export const supabase = createClient(url, key);

// Admin client with service role key — bypasses RLS, server-side only
export const supabaseAdmin = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? key,
);

// Server-side client: passes cache:'no-store' on every fetch so Next.js
// never caches Supabase responses between requests
export const supabaseServer = createClient(url, key, {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: 'no-store' }),
  },
});

export interface SupabaseProduct {
  id: number;
  name_lv: string;
  name_ru: string;
  name_en: string;
  brand: string;
  price: number;
  install_price: number;
  power_kw: number;
  area_coverage: string;
  energy_class: string;
  features: string[];
  image_url: string;
  category: string;
  brand_color: string;
  in_stock: boolean;
  is_hit: boolean;
  is_promo: boolean;
  discount_percent: number | null;
  created_at: string;
  description_lv?: string;
  description_ru?: string;
  description_en?: string;
  specs?: Record<string, string>;
}

export function productDescription(p: SupabaseProduct, locale: string): string {
  if (locale === 'lv') return p.description_lv || p.description_ru || p.description_en || '';
  if (locale === 'ru') return p.description_ru || p.description_lv || p.description_en || '';
  return p.description_en || p.description_ru || p.description_lv || '';
}

export interface SupabaseContact {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
}

export interface SupabaseSetting {
  id: number;
  key: string;
  value: string;
}

export interface SupabaseReview {
  id: number;
  author_name: string;
  text_lv: string;
  text_ru: string;
  text_en: string;
  rating: number;
  is_visible: boolean;
  created_at: string;
}

export interface SupabaseHeroSlide {
  id: number;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export function productFeatures(p: SupabaseProduct, locale: string): string[] {
  const prefix = `${locale}:`;
  const localeFeatures = p.features.filter(f => f.startsWith(prefix)).map(f => f.slice(prefix.length));
  if (localeFeatures.length) return localeFeatures;
  // Fallback: untagged features (old format without locale prefix)
  const untagged = p.features.filter(f => !/^(lv|ru|en):/.test(f));
  return untagged.length ? untagged : p.features;
}

export function productName(p: SupabaseProduct, locale: string): string {
  if (locale === 'lv') return p.name_lv || p.name_en;
  if (locale === 'ru') return p.name_ru || p.name_en;
  return p.name_en;
}

export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabaseServer.from('settings').select('key,value');
  const map: Record<string, string> = {};
  if (data) data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
  return map;
}

export function productImages(p: SupabaseProduct): string[] {
  if (p.image_url?.startsWith('[')) {
    try {
      const parsed = JSON.parse(p.image_url);
      if (Array.isArray(parsed) && parsed.length) return parsed as string[];
    } catch { /* fall through */ }
  }
  if (p.image_url) return [p.image_url];
  return [];
}

export function settingFor(settings: Record<string, string>, key: string, fallback = ''): string {
  return settings[key] || fallback;
}

export async function getHeroSlides(): Promise<string[]> {
  const { data } = await supabaseServer
    .from('hero_slides')
    .select('image_url')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (!data || data.length === 0) return [];
  return (data as { image_url: string }[]).map((r) => r.image_url);
}
