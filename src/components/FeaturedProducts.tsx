import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { supabaseServer, type SupabaseProduct, productName, productFeatures, productImages, getSettings } from '@/lib/supabase';

const energyColors: Record<string, string> = {
  'A+++': 'text-[#27C4A0] border-[#27C4A0]/30 bg-[#27C4A0]/10',
  'A++': 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  'A+': 'text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10',
};

function ProductCard({ product, locale, t, installFrom }: { product: SupabaseProduct; locale: string; t: (k: string, v?: Record<string, unknown>) => string; installFrom: number }) {
  const name = productName(product, locale);
  const features = productFeatures(product, locale);
  const energyCls = energyColors[product.energy_class] ?? 'text-white/50 border-white/20 bg-white/5';

  return (
    <div className="glass-card product-card-hover rounded-2xl overflow-hidden flex flex-col group h-full">
      <div className="h-44 flex items-center justify-center relative overflow-hidden bg-white">
        {productImages(product)[0] ? (
          <img src={productImages(product)[0]} alt={name} className="h-full w-full object-contain p-4" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-14 h-14 opacity-20 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-2xl font-syne font-bold opacity-70" style={{ color: product.brand_color }}>{product.brand}</span>
          </div>
        )}
        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-lg border ${energyCls}`}>{product.energy_class}</div>
        {(product.is_hit || product.is_promo || !!product.discount_percent) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_hit && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f97316] text-white shadow-sm">{t('badgeHit')}</span>}
            {product.is_promo && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e91e8c] text-white shadow-sm">{t('badgePromo')}</span>}
            {!!product.discount_percent && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eab308] text-black shadow-sm">-{product.discount_percent}%</span>}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-auto">
          <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
          <h3 className="font-syne font-semibold text-base text-white mb-3 leading-tight">{name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <svg className="w-3.5 h-3.5 text-[#1A6B9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>{t('power')}: <strong className="text-white/70">{product.power_kw} kW</strong></span>
            </div>
            {product.area_coverage && (
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <svg className="w-3.5 h-3.5 text-[#1A6B9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                <span>{product.area_coverage} m²</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {features.map((f) => (
              <span key={f} className="text-xs text-white/40 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md">{f}</span>
            ))}
          </div>
        </div>
        <div className="border-t border-[#1A6B9A]/15 pt-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              {!product.price ? (
                <p className="font-syne font-semibold text-base text-white/50">{t('priceOnRequest')}</p>
              ) : product.discount_percent ? (
                <>
                  <p className="text-xs text-white/35 mb-0.5">{t('from')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-white/35 line-through">{product.price.toLocaleString('lv-LV')} €</span>
                    <span className="font-syne font-bold text-2xl text-[#27C4A0]">
                      {Math.round(product.price * (1 - product.discount_percent / 100)).toLocaleString('lv-LV')} €
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-white/35 mb-0.5">{t('from')}</p>
                  <p className="font-syne font-bold text-2xl text-white">{product.price.toLocaleString('lv-LV')} €</p>
                </>
              )}
            </div>
            <p className="text-xs text-white/35 text-right">{t('installFrom', { price: installFrom })}</p>
          </div>
          <Link href={`/catalog/${product.id}` as any}
            className="w-full flex items-center justify-center gap-2 bg-[#1A6B9A]/20 hover:bg-[#27C4A0] border border-[#1A6B9A]/40 hover:border-[#27C4A0] text-white hover:text-[#072D47] font-semibold text-sm py-2.5 rounded-xl transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {t('viewBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Seeded LCG shuffle — same result all day, different result tomorrow (UTC midnight)
function dailyShuffle<T>(arr: T[]): T[] {
  const seed = Math.floor(Date.now() / 86_400_000); // changes every 24h UTC
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function FeaturedProducts() {
  const [t, locale, settings] = await Promise.all([getTranslations('products'), getLocale(), getSettings()]);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;

  const { data } = await supabaseServer
    .from('products')
    .select('*')
    .eq('in_stock', true);

  const all = data ?? [];
  if (!all.length) return null;
  const products = dailyShuffle(all).slice(0, 3);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1A6B9A]/8 blur-[80px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="reveal flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-syne font-bold text-3xl sm:text-4xl mb-2">{t('featured')}</h2>
            <p className="text-white/45">{t('featuredSubtitle')}</p>
          </div>
          <Link href="/catalog" className="inline-flex items-center gap-2 text-[#27C4A0] hover:text-white text-sm font-semibold transition-colors group flex-shrink-0">
            {t('viewAll')}
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="reveal flex flex-col" data-stagger={i}>
              <ProductCard product={p as SupabaseProduct} locale={locale} t={(k, v) => t(k as Parameters<typeof t>[0], v as any)} installFrom={installFrom} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
