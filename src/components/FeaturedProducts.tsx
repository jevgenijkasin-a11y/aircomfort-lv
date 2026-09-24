import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { listProducts, getSettings } from '@/lib/db';

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

  const all = await listProducts({ inStockOnly: true });
  if (!all.length) return null;
  const products = dailyShuffle(all).slice(0, 3);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1A6B9A]/8 blur-[80px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="reveal flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-syne font-bold text-3xl sm:text-4xl mb-2">{t('featured')}</h2>
            <p className="text-white/70">{t('featuredSubtitle')}</p>
          </div>
          <Link href="/catalog" className="inline-flex items-center gap-2 text-[#27C4A0] hover:text-white text-sm font-semibold transition-colors group flex-shrink-0">
            {t('viewAll')}
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </Link>
        </div>
        <div className="reveal-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="reveal-3d flex flex-col" data-stagger={i}>
              <ProductCard product={p as SupabaseProduct} locale={locale} installFrom={installFrom} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
