// Shared data types and pure helpers — safe to import from both server and client code.
// (Type names keep the historical "Supabase" prefix from the old backend to avoid mass renames.)

export interface SupabaseProduct {
  id: string;
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

export interface EmployeeCard {
  id: string;
  slug: string;
  token: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  photo_url: string | null;
  photo_position: number; // 0-100, vertical % for objectPosition
  is_active: boolean;
  created_at: string;
}

export function productDescription(p: SupabaseProduct, locale: string): string {
  if (locale === 'lv') return p.description_lv || p.description_ru || p.description_en || '';
  if (locale === 'ru') return p.description_ru || p.description_lv || p.description_en || '';
  return p.description_en || p.description_ru || p.description_lv || '';
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
