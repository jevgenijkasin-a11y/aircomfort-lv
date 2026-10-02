// Admin panel logic: product form <-> API payload conversion, site-text keys
// and settings defaults.
import type { AdminProduct, ProductSpecs, SiteSettings } from '@/lib/adminTypes';

// ── products ──────────────────────────────────────────────────────────

// Spec keys used only by fan coils (removed when a product is not a fan coil)
export const FAN_ONLY_SPECS = ['pipe_system', 'fan_motor', 'esp_pa'] as const;
// General spec fields that the fan coil block already edits
export const FAN_SHARED_SPECS = ['cooling_kw', 'heating_kw', 'airflow', 'noise_db'];

export type ProductForm = Omit<AdminProduct, 'id' | 'created_at'> & { id?: string };

export const EMPTY_SPECS: ProductSpecs = {
  manufacturer: '', cooling_kw: '', heating_kw: '',
  scop: '', seer: '', noise_db: '', airflow: '',
  operating_temp: '', mounting: '', refrigerant: '',
  wifi: '', electrical: '', indoor_dims: '', outdoor_dims: '',
};

export const EMPTY_PRODUCT: ProductForm = {
  brand: '', name_lv: '', name_ru: '', name_en: '',
  category: 'home', power_kw: 2.5, area_coverage: '20–25',
  price: 0, install_price: 249, energy_class: 'A++',
  features: [], features_lv: [], features_ru: [], features_en: [],
  description_lv: '', description_ru: '', description_en: '',
  specs: { ...EMPTY_SPECS },
  brand_color: '#1A6B9A', image_url: '', image_urls: [], in_stock: true,
  is_hit: false, is_promo: false, discount_percent: null, compatible_ids: [],
};

export const ENERGY_CLASSES = ['A+++', 'A++', 'A+', 'A', 'B'];

export const MOUNTING_OPTIONS = [
  { value: 'wall',     ru: 'Настенный',    en: 'Wall-mounted', lv: 'Sienas' },
  { value: 'cassette', ru: 'Кассетный',    en: 'Cassette',     lv: 'Kasetes' },
  { value: 'floor',    ru: 'Напольный',    en: 'Floor-standing', lv: 'Grīdas' },
  { value: 'ceiling',  ru: 'Потолочный',   en: 'Ceiling',      lv: 'Griestu' },
  { value: 'duct',     ru: 'Канальный',    en: 'Ducted',       lv: 'Kanālu' },
  { value: 'column',   ru: 'Колонный',     en: 'Column',       lv: 'Kolonnas' },
  { value: 'rooftop',  ru: 'Руфтоп',       en: 'Rooftop',      lv: 'Jumta' },
];

export const ELECTRICAL_OPTIONS = [
  { value: '1ph_220',      ru: '1Ф, 220~240 В',          en: '1Ph, 220~240 V',        lv: '1F, 220~240 V' },
  { value: '1ph_220_50hz', ru: '1Ф, 220~240 В, 50 Гц',   en: '1Ph, 220~240 V, 50 Hz', lv: '1F, 220~240 V, 50 Hz' },
  { value: '2ph_220',      ru: '2Ф, 220~240 В',          en: '2Ph, 220~240 V',        lv: '2F, 220~240 V' },
  { value: '2ph_220_50hz', ru: '2Ф, 220~240 В, 50 Гц',   en: '2Ph, 220~240 V, 50 Hz', lv: '2F, 220~240 V, 50 Hz' },
  { value: '3ph_380',      ru: '3Ф, 380~415 В',          en: '3Ph, 380~415 V',        lv: '3F, 380~415 V' },
  { value: '3ph_380_50hz', ru: '3Ф, 380~415 В, 50 Гц',   en: '3Ph, 380~415 V, 50 Hz', lv: '3F, 380~415 V, 50 Hz' },
];

/** Gallery URLs from image_url (a single URL or a JSON array). */
export function productImageUrls(imageUrl: string | undefined): string[] {
  if (imageUrl?.startsWith('[')) {
    try { return JSON.parse(imageUrl); } catch { return imageUrl ? [imageUrl] : []; }
  }
  return imageUrl ? [imageUrl] : [];
}

export function firstImage(imageUrl: string): string {
  if (imageUrl?.startsWith('[')) {
    try { return (JSON.parse(imageUrl) as string[])[0] || ''; } catch { /* ignore */ }
  }
  return imageUrl || '';
}

/** Product from the API → editable form state (locale features split, gallery list). */
export function productToForm(p: AdminProduct): ProductForm & { id: string } {
  const hasLocale = p.features.some(f => /^(lv|ru|en):/.test(f));
  return {
    ...p,
    image_urls: productImageUrls(p.image_url),
    features_lv: hasLocale ? p.features.filter(f => f.startsWith('lv:')).map(f => f.slice(3)) : [],
    features_ru: hasLocale ? p.features.filter(f => f.startsWith('ru:')).map(f => f.slice(3)) : [],
    features_en: hasLocale ? p.features.filter(f => f.startsWith('en:')).map(f => f.slice(3)) : p.features,
    description_lv: p.description_lv ?? '',
    description_ru: p.description_ru ?? '',
    description_en: p.description_en ?? '',
    specs: { ...EMPTY_SPECS, ...(p.specs ?? {}) },
  };
}

/** "Copy product": same data without id, names marked as a copy. */
export function productCopyForm(p: AdminProduct): ProductForm {
  const { id: _id, created_at: _ca, ...rest } = productToForm(p) as AdminProduct & { image_urls: string[]; features_lv: string[]; features_ru: string[]; features_en: string[] };
  // The copy keeps category, fan coil parameters (specs) and compatible products
  return {
    ...rest,
    compatible_ids: [...(rest.compatible_ids ?? [])],
    name_lv: rest.name_lv ? rest.name_lv + ' (kopija)' : rest.name_lv,
    name_ru: rest.name_ru ? rest.name_ru + ' (копия)' : rest.name_ru,
    name_en: rest.name_en ? rest.name_en + ' (copy)' : rest.name_en,
  };
}

/** Form state → body for POST/PUT /api/admin/products. */
export function buildProductPayload(fields: Omit<AdminProduct, 'id'>, fanCoil: boolean) {
  const parseStr = (v: unknown) =>
    typeof v === 'string' ? v.split(',').map(f => f.trim()).filter(Boolean)
    : Array.isArray(v) ? v : [];

  const tagged = (arr: string[], lng: string) => arr.map(f => `${lng}:${f}`);

  const lv = parseStr(fields.features_lv);
  const ru = parseStr(fields.features_ru);
  const en = parseStr(fields.features_en);
  const hasLocale = lv.length || ru.length || en.length;
  const features = hasLocale
    ? [...tagged(lv, 'lv'), ...tagged(ru, 'ru'), ...tagged(en, 'en')]
    : parseStr(fields.features);

  // Filter out empty spec values
  const rawSpecs = fields.specs ?? {};
  const specs: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawSpecs)) {
    if (v && v.trim()) specs[k] = v.trim();
  }
  if (!fanCoil) for (const k of FAN_ONLY_SPECS) delete specs[k];

  const { features_lv: _flv, features_ru: _fru, features_en: _fen, features: _f, image_urls: _iu, specs: _sp, ...restFields } = fields;
  const imageUrls: string[] = (fields.image_urls as string[]) || [];
  const imageUrlValue = imageUrls.length > 1
    ? JSON.stringify(imageUrls)
    : (imageUrls[0] || '');
  return {
    ...restFields,
    features,
    image_url: imageUrlValue,
    power_kw: Number(fields.power_kw),
    price: Number(fields.price),
    install_price: Number(fields.install_price),
    discount_percent: fields.discount_percent ? Number(fields.discount_percent) : null,
    description_lv: fields.description_lv ?? '',
    description_ru: fields.description_ru ?? '',
    description_en: fields.description_en ?? '',
    specs: Object.keys(specs).length ? specs : null,
    compatible_ids: fields.compatible_ids ?? [],
  };
}

// ── site texts ───────────────────────────────────────────────────

export const TEXT_KEYS = [
  // Hero
  'hero_title_lv', 'hero_title_ru', 'hero_title_en',
  'hero_subtitle_lv', 'hero_subtitle_ru', 'hero_subtitle_en',
  // Services section
  'services_title_lv', 'services_title_ru', 'services_title_en',
  'services_subtitle_lv', 'services_subtitle_ru', 'services_subtitle_en',
  'svc_supply_lv', 'svc_supply_ru', 'svc_supply_en',
  'svc_supply_desc_lv', 'svc_supply_desc_ru', 'svc_supply_desc_en',
  'svc_install_lv', 'svc_install_ru', 'svc_install_en',
  'svc_install_desc_lv', 'svc_install_desc_ru', 'svc_install_desc_en',
  'svc_maint_lv', 'svc_maint_ru', 'svc_maint_en',
  'svc_maint_desc_lv', 'svc_maint_desc_ru', 'svc_maint_desc_en',
  'svc_consult_lv', 'svc_consult_ru', 'svc_consult_en',
  'svc_consult_desc_lv', 'svc_consult_desc_ru', 'svc_consult_desc_en',
  // Categories section
  'cats_title_lv', 'cats_title_ru', 'cats_title_en',
  'cats_subtitle_lv', 'cats_subtitle_ru', 'cats_subtitle_en',
  'cat_home_lv', 'cat_home_ru', 'cat_home_en',
  'cat_home_desc_lv', 'cat_home_desc_ru', 'cat_home_desc_en',
  'cat_hp_lv', 'cat_hp_ru', 'cat_hp_en',
  'cat_hp_desc_lv', 'cat_hp_desc_ru', 'cat_hp_desc_en',
  'cat_comm_lv', 'cat_comm_ru', 'cat_comm_en',
  'cat_comm_desc_lv', 'cat_comm_desc_ru', 'cat_comm_desc_en',
  'cat_ihp_lv', 'cat_ihp_ru', 'cat_ihp_en',
  'cat_ihp_desc_lv', 'cat_ihp_desc_ru', 'cat_ihp_desc_en',
];

// ── settings ────────────────────────────────────────────────────────

export const SETTINGS_DEFAULTS: SiteSettings = {
  phone: '', email: '', address: '', hours: '',
  whatsapp_number: '', telegram_username: '',
  hero_title_lv: '', hero_title_ru: '', hero_title_en: '',
  hero_subtitle_lv: '', hero_subtitle_ru: '', hero_subtitle_en: '',
  stat1_value: '500+', stat1_label_lv: '', stat1_label_ru: '', stat1_label_en: '',
  stat2_value: '5', stat2_label_lv: '', stat2_label_ru: '', stat2_label_en: '',
  stat3_value: '10+', stat3_label_lv: '', stat3_label_ru: '', stat3_label_en: '',
  contacts_title_lv: '', contacts_title_ru: '', contacts_title_en: '',
  contacts_subtitle_lv: '', contacts_subtitle_ru: '', contacts_subtitle_en: '',
  contacts_form_title_lv: '', contacts_form_title_ru: '', contacts_form_title_en: '',
  install_price_from: '250',
  install_price_to: '350',
} as SiteSettings;

/** Settings rows from GET /api/admin/settings → key/value map. */
export const settingsMap = (rows: { key: string; value: string }[] | null | undefined) => {
  const map: Record<string, string> = {};
  (rows ?? []).forEach((r) => { map[r.key] = r.value; });
  return map;
};
