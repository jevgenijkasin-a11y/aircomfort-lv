import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { supabaseServer, type SupabaseProduct, productName, productFeatures } from '@/lib/supabase';
import ProductImageViewer from '@/components/ProductImageViewer';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const { data } = await supabaseServer.from('products').select('name_lv,name_ru,name_en').eq('id', id).single();
  if (!data) return { title: 'Product' };
  const name = locale === 'lv' ? data.name_lv : locale === 'ru' ? data.name_ru : data.name_en;
  return { title: name || 'Product' };
}

const energyColors: Record<string, string> = {
  'A+++': 'text-[#27C4A0] border-[#27C4A0]/30 bg-[#27C4A0]/10',
  'A++': 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  'A+': 'text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10',
};

export default async function ProductPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const [t, tp, { data: product }] = await Promise.all([
    getTranslations('catalog'),
    getTranslations('products'),
    supabaseServer.from('products').select('*').eq('id', id).single(),
  ]);

  if (!product) notFound();

  const p = product as SupabaseProduct;
  const name = productName(p, locale);
  const features = productFeatures(p, locale);
  const energyCls = energyColors[p.energy_class] ?? 'text-white/50 border-white/20 bg-white/5';

  return (
    <>
      {/* Header */}
      <div className="pt-28 pb-6 bg-gradient-to-b from-[#051e31] to-[#072D47] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-white/40 hover:text-[#27C4A0] text-sm transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('backToCatalog')}
          </Link>
          <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-widest mb-1">{p.brand}</p>
          <h1 className="font-syne font-bold text-3xl sm:text-4xl">{name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image with lightbox */}
          <div className="glass-card rounded-2xl overflow-hidden relative">
            <ProductImageViewer
              src={p.image_url}
              alt={name}
              brandColor={p.brand_color}
              brand={p.brand}
            />
            <div className={`absolute top-4 right-4 text-sm font-bold px-3 py-1 rounded-xl border ${energyCls}`}>{p.energy_class}</div>

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
                  <p className="text-white/40 text-xs mb-1">{tp('from')}</p>
                  <p className="font-syne font-bold text-2xl text-white">{p.price.toLocaleString('lv-LV')} €</p>
                </div>
              </div>
              {p.install_price > 0 && (
                <div className="flex items-center justify-between py-3 border-t border-[#1A6B9A]/15">
                  <span className="text-white/50 text-sm">{tp('installIncluded')}</span>
                  <span className="font-semibold text-white">+{p.install_price} €</span>
                </div>
              )}
              <div className="pt-2">
                <p className="text-white/35 text-xs mb-3">{tp('from')} {(p.price + (p.install_price || 0)).toLocaleString('lv-LV')} € {tp('installIncluded').toLowerCase()}</p>
              </div>
            </div>

            <Link
              href="/contacts"
              className="w-full flex items-center justify-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-bold py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-[#27C4A0]/25 hover:-translate-y-0.5 text-base"
            >
              {tp('order')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>

            <p className="text-white/25 text-xs text-center">
              {locale === 'lv' ? 'Bezmaksas piegāde un profesionāla uzstādīšana' :
               locale === 'ru' ? 'Бесплатная доставка и профессиональная установка' :
               'Free delivery and professional installation'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
