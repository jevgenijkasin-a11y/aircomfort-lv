// Data shapes used by the admin panel (products, requests, site settings).

export interface AdminRequest {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ProductSpecs {
  manufacturer?: string;
  cooling_kw?: string;
  heating_kw?: string;
  scop?: string;
  seer?: string;
  noise_db?: string;
  airflow?: string;
  operating_temp?: string;
  mounting?: string;
  refrigerant?: string;
  wifi?: string;
  electrical?: string;
  indoor_dims?: string;
  outdoor_dims?: string;
  // Fan coils
  pipe_system?: string;
  fan_motor?: string;
  esp_pa?: string;
}

export interface AdminProduct {
  id: string;
  brand: string;
  name_lv: string;
  name_ru: string;
  name_en: string;
  category: string;
  power_kw: number;
  area_coverage: string;
  price: number;
  install_price: number;
  energy_class: string;
  features: string[];
  features_lv?: string[] | string;
  features_ru?: string[] | string;
  features_en?: string[] | string;
  description_lv?: string;
  description_ru?: string;
  description_en?: string;
  specs?: ProductSpecs;
  brand_color: string;
  image_url: string;
  image_urls: string[];
  in_stock: boolean;
  is_hit: boolean;
  is_promo: boolean;
  discount_percent: number | null;
  compatible_ids?: string[];
  created_at?: string;
}

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsapp_number: string;
  telegram_username: string;
  hero_title_lv: string;
  hero_title_ru: string;
  hero_title_en: string;
  hero_subtitle_lv: string;
  hero_subtitle_ru: string;
  hero_subtitle_en: string;
  stat1_value: string;
  stat1_label_lv: string;
  stat1_label_ru: string;
  stat1_label_en: string;
  stat2_value: string;
  stat2_label_lv: string;
  stat2_label_ru: string;
  stat2_label_en: string;
  stat3_value: string;
  stat3_label_lv: string;
  stat3_label_ru: string;
  stat3_label_en: string;
  contacts_title_lv: string;
  contacts_title_ru: string;
  contacts_title_en: string;
  contacts_subtitle_lv: string;
  contacts_subtitle_ru: string;
  contacts_subtitle_en: string;
  contacts_form_title_lv: string;
  contacts_form_title_ru: string;
  contacts_form_title_en: string;
  install_price_from: string;
  install_price_to: string;
}

