export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct, productName, productFeatures, productImages, productDescription } from '@/lib/types';
import { getProduct, getSettings } from '@/lib/db';
import { localizedAlternates } from '@/lib/seo';
import ProductImageViewer from '@/components/ProductImageViewer';
import BackLink from '@/components/BackLink';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const data = await getProduct(id);
  if (!data) return { title: 'Product' };
  const name = locale === 'lv' ? data.name_lv : locale === 'ru' ? data.name_ru : data.name_en;
  return {
    title: name || 'Product',
    alternates: localizedAlternates(locale, `/catalog/${id}`),
  };
}

const energyColors: Record<string, string> = {
  'A+++': 'text-[#27C4A0] border-[#27C4A0]/30 bg-[#27C4A0]/10',
  'A++': 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  'A+': 'text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10',
};

function buildContactMessage(p: SupabaseProduct, name: string, locale: string, installFrom: number): string {
  const finalPrice = p.price && p.discount_percent
    ? Math.round(p.price * (1 - p.discount_percent / 100))
    : p.price;

  if (locale === 'lv') {
    const lines = [`Interesē: ${p.brand} ${name}`];
    if (p.power_kw) lines.push(`Jauda: ${p.power_kw} kW`);
    if (p.area_coverage) lines.push(`Platība: ${p.area_coverage} m²`);
    if (finalPrice) lines.push(`Cena: ${finalPrice} €`);
    lines.push(`Uzstādīšana no: ${installFrom} €`);
    return lines.join('\n');
  }
  if (locale === 'en') {
    const lines = [`Interested in: ${p.brand} ${name}`];
    if (p.power_kw) lines.push(`Power: ${p.power_kw} kW`);
    if (p.area_coverage) lines.push(`Area: ${p.area_coverage} m²`);
    if (finalPrice) lines.push(`Price: ${finalPrice} €`);
    lines.push(`Installation from: ${installFrom} €`);
    return lines.join('\n');
  }
  // ru (default)
  const lines = [`Интересует: ${p.brand} ${name}`];
  if (p.power_kw) lines.push(`Мощность: ${p.power_kw} kW`);
  if (p.area_coverage) lines.push(`Площадь: ${p.area_coverage} m²`);
  if (finalPrice) lines.push(`Цена: ${finalPrice} €`);
  lines.push(`Монтаж от: ${installFrom} €`);
  return lines.join('\n');
}

const MOUNTING_VALUES: Record<string, Record<string, string>> = {
  wall:     { ru: 'Настенный',  lv: 'Sienas',    en: 'Wall-mounted' },
  cassette: { ru: 'Кассетный',  lv: 'Kasetes',   en: 'Cassette' },
  floor:    { ru: 'Напольный',  lv: 'Grīdas',    en: 'Floor-standing' },
  ceiling:  { ru: 'Потолочный', lv: 'Griesta',   en: 'Ceiling' },
  duct:     { ru: 'Канальный',  lv: 'Kanālu',    en: 'Ducted' },
  column:   { ru: 'Колонный',   lv: 'Kolonnas',  en: 'Column' },
  rooftop:  { ru: 'Руфтоп',     lv: 'Jumta',     en: 'Rooftop' },
};

const WIFI_VALUES: Record<string, string> = { ru: 'Да', lv: 'Jā', en: 'Yes' };

const ELECTRICAL_VALUES: Record<string, Record<string, string>> = {
  '1ph_220':      { ru: '1Ф, 220~240 В',        lv: '1Φ, 220~240 V',        en: '1Ph, 220~240 V' },
  '1ph_220_50hz': { ru: '1Ф, 220~240 В, 50 Гц',  lv: '1Φ, 220~240 V, 50 Hz', en: '1Ph, 220~240 V, 50 Hz' },
  '2ph_220':      { ru: '2Ф, 220~240 В',        lv: '2Φ, 220~240 V',        en: '2Ph, 220~240 V' },
  '2ph_220_50hz': { ru: '2Ф, 220~240 В, 50 Гц',  lv: '2Φ, 220~240 V, 50 Hz', en: '2Ph, 220~240 V, 50 Hz' },
  '3ph_380':      { ru: '3Ф, 380~415 В',        lv: '3Φ, 380~415 V',        en: '3Ph, 380~415 V' },
  '3ph_380_50hz': { ru: '3Ф, 380~415 В, 50 Гц',  lv: '3Φ, 380~415 V, 50 Hz', en: '3Ph, 380~415 V, 50 Hz' },
};

function translateSpecValue(key: string, value: string, locale: string): string {
  if (key === 'mounting') return MOUNTING_VALUES[value]?.[locale] ?? MOUNTING_VALUES[value]?.en ?? value;
  if (key === 'wifi') return value === 'yes' ? (WIFI_VALUES[locale] ?? 'Yes') : '';
  if (key === 'electrical') return ELECTRICAL_VALUES[value]?.[locale] ?? ELECTRICAL_VALUES[value]?.en ?? value;
  return value;
}

const SPEC_LABELS: Record<string, Record<string, string>> = {
  manufacturer:   { ru: 'Производитель', lv: 'Ražotājs', en: 'Manufacturer' },
  cooling_kw:     { ru: 'Холодопроизводительность', lv: 'Dzesēšanas jauda', en: 'Cooling Capacity' },
  heating_kw:     { ru: 'Тепловая мощность', lv: 'Sildīšanas jauda', en: 'Heating Capacity' },
  scop:           { ru: 'SCOP', lv: 'SCOP', en: 'SCOP' },
  seer:           { ru: 'SEER', lv: 'SEER', en: 'SEER' },
  noise_db:       { ru: 'Уровень шума (дБ)', lv: 'Trokšņa līmenis (dB)', en: 'Noise Level (dB)' },
  airflow:        { ru: 'Объём воздуха (м³/ч)', lv: 'Gaisa plūsma (m³/h)', en: 'Airflow (m³/h)' },
  operating_temp: { ru: 'Рабочая температура', lv: 'Darba temperatūra', en: 'Operating Temperature' },
  mounting:       { ru: 'Тип крепления', lv: 'Stiprinājuma veids', en: 'Mounting Type' },
  refrigerant:    { ru: 'Тип хладагента', lv: 'Aukstumaģenta veids', en: 'Refrigerant Type' },
  wifi:           { ru: 'Wi-Fi', lv: 'Wi-Fi', en: 'Wi-Fi' },
  electrical:     { ru: 'Электрическое соединение', lv: 'Elektriskais savienojums', en: 'Electrical Connection' },
  indoor_dims:    { ru: 'Габариты внутреннего блока', lv: 'Iekšējā bloka izmēri', en: 'Indoor Unit Dimensions' },
  outdoor_dims:   { ru: 'Габариты наружного блока', lv: 'Ārējā bloka izmēri', en: 'Outdoor Unit Dimensions' },
};

export default async function ProductPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const [t, tp, product, settings] = await Promise.all([
    getTranslations('catalog'),
    getTranslations('products'),
    getProduct(id),
    getSettings(),
  ]);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;

  if (!product) notFound();

  const p = product as SupabaseProduct;
  const name = productName(p, locale);
  const features = productFeatures(p, locale);
  const images = productImages(p);
  const energyCls = energyColors[p.energy_class] ?? 'text-white/50 border-white/20 bg-white/5';

  const contactMessage = buildContactMessage(p, name, locale, installFrom);
  const contactHref = `/contacts?service=install&message=${encodeURIComponent(contactMessage)}`;
  const description = productDescription(p, locale);
  const SPEC_ORDER = [
    'manufacturer', 'cooling_kw', 'heating_kw', 'scop', 'seer',
    'noise_db', 'airflow', 'operating_temp', 'mounting', 'refrigerant',
    'wifi', 'electrical', 'indoor_dims', 'outdoor_dims',
  ];
  const rawSpecs = p.specs && typeof p.specs === 'object' ? (p.specs as Record<string, string>) : {};
  const specs = SPEC_ORDER
    .map((k) => [k, translateSpecValue(k, rawSpecs[k] ?? '', locale)] as [string, string])
    .filter(([, v]) => v);

  return (
    <>
      {/* Header */}
      <div className="pt-36 pb-6 bg-gradient-to-b from-[#051e31] to-[#072D47] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <BackLink label={t('backToCatalog')} />
          <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-widest mb-1">{p.brand}</p>
          <h1 className="font-syne font-bold text-3xl sm:text-4xl mb-3">{name}</h1>
          {(p.is_hit || p.is_promo || !!p.discount_percent) && (
            <div className="flex flex-wrap gap-2">
              {p.is_hit && <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#f97316] text-white shadow-md">{tp('badgeHit')}</span>}
              {p.is_promo && <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#e91e8c] text-white shadow-md">{tp('badgePromo')}</span>}
              {!!p.discount_percent && <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#eab308] text-black shadow-md">−{p.discount_percent}%</span>}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image with lightbox */}
          <div className="glass-card rounded-2xl overflow-hidden relative">
            <ProductImageViewer
              images={images}
              alt={name}
              brandColor={p.brand_color}
              brand={p.brand}
            />
            <div className={`absolute top-4 right-4 text-sm font-bold px-3 py-1 rounded-xl border ${energyCls}`}>{p.energy_class}</div>
            {(p.is_hit || p.is_promo || !!p.discount_percent) && (
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {p.is_hit && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f97316] text-white shadow-sm">{tp('badgeHit')}</span>}
                {p.is_promo && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e91e8c] text-white shadow-sm">{tp('badgePromo')}</span>}
                {!!p.discount_percent && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#eab308] text-black shadow-sm">−{p.discount_percent}%</span>}
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="p-6 border-t border-[#1A6B9A]/15">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">{t('features')}</p>
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span key={f} className="text-sm text-white/70 bg-[#0A3658] border border-[#1A6B9A]/25 px-3 py-1.5 rounded-xl">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A3658]/50 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">{tp('power')}</p>
                  <p className="font-syne font-bold text-2xl text-[#27C4A0]">{p.power_kw} <span className="text-sm font-normal">kW</span></p>
                </div>
                {p.area_coverage && (
                  <div className="bg-[#0A3658]/50 rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-1">{tp('area')}</p>
                    <p className="font-syne font-bold text-2xl text-[#27C4A0]">{p.area_coverage} <span className="text-sm font-normal">m²</span></p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A3658]/50 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">{tp('energyClass')}</p>
                  <p className={`font-syne font-bold text-xl ${energyColors[p.energy_class]?.split(' ')[0] ?? 'text-white'}`}>{p.energy_class}</p>
                </div>
                <div className="bg-[#0A3658]/50 rounded-xl p-4">
                  {!p.price ? (
                    <p className="font-syne font-semibold text-base text-white/50">{tp('priceOnRequest')}</p>
                  ) : p.discount_percent ? (
                    <>
                      <p className="text-sm text-white/35 line-through leading-none mb-1">{p.price.toLocaleString('lv-LV')} €</p>
                      <p className="font-syne font-bold text-2xl text-[#27C4A0]">
                        {Math.round(p.price * (1 - p.discount_percent / 100)).toLocaleString('lv-LV')} €
                      </p>
                    </>
                  ) : (
                    <p className="font-syne font-bold text-2xl text-white">{p.price.toLocaleString('lv-LV')} €</p>
                  )}
                </div>
              </div>
              {!!p.price && !!p.discount_percent && (
                <div className="bg-[#eab308]/10 border border-[#eab308]/25 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs mb-0.5">{tp('wasPrice')}</p>
                    <p className="text-white/50 text-base line-through">{p.price.toLocaleString('lv-LV')} €</p>
                  </div>
                  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" /></svg>
                  <div className="text-right">
                    <p className="text-[#27C4A0] text-xs mb-0.5">{tp('nowPrice')} −{p.discount_percent}%</p>
                    <p className="font-syne font-bold text-xl text-[#27C4A0]">
                      {Math.round(p.price * (1 - p.discount_percent / 100)).toLocaleString('lv-LV')} €
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center py-3 border-t border-[#1A6B9A]/15">
                <span className="text-white/50 text-sm">{tp('installFrom', { price: installFrom })}</span>
              </div>
            </div>

            <Link
              href={contactHref as any}
              className="w-full flex items-center justify-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-bold py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-[#27C4A0]/25 hover:-translate-y-0.5 text-base"
            >
              {tp('order')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>

            {/* Description */}
            {description && (
              <div className="glass-card rounded-2xl p-6">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
                  {locale === 'lv' ? 'Apraksts' : locale === 'ru' ? 'Описание' : 'Description'}
                </p>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specs table — full width below main grid */}
        {specs.length > 0 && (
          <div className="mt-10">
            <div className="glass-card rounded-2xl p-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-5">
                {t('specsLabel')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {specs.map(([key, value], i) => (
                  <div key={key} className={`flex items-start justify-between py-3 px-4 ${i % 2 === 0 ? '' : ''} border-b border-[#1A6B9A]/12 last:border-b-0`}>
                    <span className="text-white/45 text-sm pr-4">
                      {SPEC_LABELS[key]?.[locale] ?? SPEC_LABELS[key]?.en ?? key}
                    </span>
                    <span className="text-white font-medium text-sm text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
