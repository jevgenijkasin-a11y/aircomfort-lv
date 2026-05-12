'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct, productName } from '@/lib/supabase';

const energyColors: Record<string, string> = {
  'A+++': 'text-[#27C4A0] border-[#27C4A0]/30 bg-[#27C4A0]/10',
  'A++': 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  'A+': 'text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10',
};


export default function CatalogClient({ initialProducts, locale, initialCategory }: { initialProducts: SupabaseProduct[]; locale: string; initialCategory?: string }) {
  const t = useTranslations('catalog');
  const tp = useTranslations('products');

  const [brand, setBrand] = useState('');
  const [power, setPower] = useState('');
  const [category, setCategory] = useState(initialCategory ?? '');
  const [sort, setSort] = useState('asc');

  const brands = useMemo(() => Array.from(new Set(initialProducts.map((p) => p.brand))), [initialProducts]);
  const powerLevels = useMemo(() => Array.from(new Set(initialProducts.map((p) => p.power_kw))).sort((a, b) => a - b), [initialProducts]);

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (brand) list = list.filter((p) => p.brand === brand);
    if (power) list = list.filter((p) => p.power_kw === parseFloat(power));
    if (category) list = list.filter((p) => p.category === category);
    list.sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
    return list;
  }, [initialProducts, brand, power, category, sort]);

  const reset = () => { setBrand(''); setPower(''); setCategory(''); setSort('asc'); };

  const selectCls = 'w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors appearance-none cursor-pointer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-card rounded-2xl p-5 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('brand')}</label>
          <div className="relative">
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectCls}>
              <option value="">{t('allBrands')}</option>
              {brands.map((b) => <option key={b} value={b} style={{ background: '#0A3658' }}>{b}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('power')}</label>
          <div className="relative">
            <select value={power} onChange={(e) => setPower(e.target.value)} className={selectCls}>
              <option value="">{t('allPowers')}</option>
              {powerLevels.map((p) => <option key={p} value={p} style={{ background: '#0A3658' }}>{p} kW</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('category')}</label>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              <option value="">{t('allCategories')}</option>
              <option value="home" style={{ background: '#0A3658' }}>{t('catHome')}</option>
              <option value="heat_pump" style={{ background: '#0A3658' }}>{t('catHeatPump')}</option>
              <option value="commercial" style={{ background: '#0A3658' }}>{t('catCommercial')}</option>
              <option value="commercial_heat_pump" style={{ background: '#0A3658' }}>{t('catCommercialHeatPump')}</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('sort')}</label>
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
              <option value="asc" style={{ background: '#0A3658' }}>{t('sortAsc')}</option>
              <option value="desc" style={{ background: '#0A3658' }}>{t('sortDesc')}</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm"><span className="text-white font-semibold">{filtered.length}</span> {t('results')}</p>
        {(brand || power || category) && (
          <button onClick={reset} className="text-[#27C4A0] text-sm hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {t('resetFilters')}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#0A3658] border border-[#1A6B9A]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-white/40 text-lg font-syne">{t('noResults')}</p>
          <p className="text-white/25 text-sm mt-1">{t('noResultsHint')}</p>
          <button onClick={reset} className="mt-5 text-[#27C4A0] text-sm font-semibold hover:text-white transition-colors">{t('resetFilters')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => <CatalogCard key={p.id} product={p} locale={locale} t={tp} tCat={t} />)}
        </div>
      )}
    </div>
  );
}

function CatalogCard({ product, locale, t, tCat }: { product: SupabaseProduct; locale: string; t: ReturnType<typeof useTranslations>; tCat: ReturnType<typeof useTranslations> }) {
  const name = productName(product, locale);
  const energyCls = energyColors[product.energy_class] ?? 'text-white/50 border-white/20 bg-white/5';

  return (
    <Link href={`/catalog/${product.id}` as any} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group">
      <div className="h-36 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${product.brand_color}18, ${product.brand_color}05)` }}>
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 60% 40%, ${product.brand_color}, transparent 70%)` }} />
        {product.image_url ? (
          <img src={product.image_url} alt={name} className="relative h-full w-full object-contain p-3" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-10 h-10 opacity-25 relative" fill="none" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-lg border ${energyCls}`}>{product.energy_class}</div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="font-syne font-semibold text-sm mb-2 leading-snug">{name}</h3>
        <div className="flex gap-3 mb-3">
          <span className="text-xs text-white/40">{product.power_kw} kW</span>
          {product.area_coverage && <span className="text-xs text-white/40">{product.area_coverage} m²</span>}
        </div>
        <div className="border-t border-[#1A6B9A]/15 pt-3 mt-auto">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-syne font-bold text-xl">{product.price.toLocaleString()} €</span>
            {product.install_price > 0 && (
              <span className="text-xs text-white/30">+{product.install_price} € {tCat('installPrice')}</span>
            )}
          </div>
          <div className="w-full flex items-center justify-center gap-2 bg-[#1A6B9A]/20 hover:bg-[#27C4A0] border border-[#1A6B9A]/40 hover:border-[#27C4A0] text-white hover:text-[#072D47] font-semibold text-sm py-2 rounded-xl transition-all duration-200 group-hover:bg-[#27C4A0] group-hover:text-[#072D47]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {tCat('viewBtn')}
          </div>
        </div>
      </div>
    </Link>
  );
}
