'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct, productName, productImages } from '@/lib/types';

const energyColors: Record<string, string> = {
  'A+++': 'text-[#0D9B78] border-[#0D9B78]/40 bg-[#D4F5EC]',
  'A++': 'text-[#16a34a] border-[#16a34a]/40 bg-[#dcfce7]',
  'A+': 'text-[#15803d] border-[#15803d]/40 bg-[#bbf7d0]',
};


import { CATALOG_PAGE_SIZE } from '@/lib/catalogData';

type Filters = { brand?: string; power?: string; category?: string; sort?: string };

/** Grid of product cards (crawlable <a> links). Used by catalog, landing pages and "similar models". */
export function ProductGrid({ products, locale, installFrom = 250 }: { products: SupabaseProduct[]; locale: string; installFrom?: number }) {
  const t = useTranslations('catalog');
  const tp = useTranslations('products');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((p) => <CatalogCard key={p.id} product={p} locale={locale} t={tp} tCat={t} installFrom={installFrom} />)}
    </div>
  );
}

export default function CatalogClient({
  initialProducts, locale, initialFilters = {}, page = 1, installFrom = 250,
}: { initialProducts: SupabaseProduct[]; locale: string; initialFilters?: Filters; page?: number; installFrom?: number }) {
  const t = useTranslations('catalog');
  const tp = useTranslations('products');
  const pathname = usePathname();

  // Initial state comes from the server (search params), so SSR HTML and the
  // hydrated client agree — the default view is ALL products, paginated.
  const [brand, setBrand] = useState(initialFilters.brand ?? '');
  const [power, setPower] = useState(initialFilters.power ?? '');
  const [category, setCategory] = useState(initialFilters.category ?? '');
  const [sort, setSort] = useState(initialFilters.sort ?? 'asc');
  const [touched, setTouched] = useState(false);

  // Sync filter state to URL without triggering Next.js navigation (only
  // after the user changes a filter, so ?page=N links stay intact).
  useEffect(() => {
    if (!touched) return;
    const p = new URLSearchParams();
    if (brand) p.set('brand', brand);
    if (power) p.set('power', power);
    if (category) p.set('category', category);
    if (sort !== 'asc') p.set('sort', sort);
    const q = p.toString();
    window.history.replaceState(null, '', q ? `${pathname}?${q}` : pathname);
    sessionStorage.setItem('catalogParams', q);
  }, [brand, power, category, sort, touched, pathname]);

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

  const reset = () => { setTouched(true); setBrand(''); setPower(''); setCategory(''); setSort('asc'); };
  const change = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => { setTouched(true); fn(e.target.value); };

  // Unfiltered view → server pagination with real links. Filtered view → full filtered list.
  const unfiltered = !brand && !power && !category && sort === 'asc';
  const totalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
  const curPage = unfiltered ? Math.min(Math.max(1, page), totalPages) : 1;
  const shown = unfiltered ? filtered.slice((curPage - 1) * CATALOG_PAGE_SIZE, curPage * CATALOG_PAGE_SIZE) : filtered;
  const pageHref = (n: number) => (n > 1 ? `/catalog?page=${n}` : '/catalog');
  const PG = {
    prev: { lv: 'Iepriekšējā', ru: 'Назад', en: 'Previous' },
    next: { lv: 'Nākamā', ru: 'Далее', en: 'Next' },
    label: { lv: 'Lapas', ru: 'Страницы', en: 'Pages' },
  };
  const L = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';

  const selectCls = 'w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors appearance-none cursor-pointer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-card rounded-2xl p-5 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('brand')}</label>
          <div className="relative">
            <select value={brand} onChange={change(setBrand)} className={selectCls}>
              <option value="">{t('allBrands')}</option>
              {brands.map((b) => <option key={b} value={b} style={{ background: '#0A3658' }}>{b}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('power')}</label>
          <div className="relative">
            <select value={power} onChange={change(setPower)} className={selectCls}>
              <option value="">{t('allPowers')}</option>
              {powerLevels.map((p) => <option key={p} value={p} style={{ background: '#0A3658' }}>{p} kW</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">{t('category')}</label>
          <div className="relative">
            <select value={category} onChange={change(setCategory)} className={selectCls}>
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
            <select value={sort} onChange={change(setSort)} className={selectCls}>
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
          {shown.map((p) => <CatalogCard key={p.id} product={p} locale={locale} t={tp} tCat={t} installFrom={installFrom} />)}
        </div>
      )}

      {/* Pagination — real <a href> links, rendered on the server */}
      {unfiltered && totalPages > 1 && (
        <nav aria-label={PG.label[L]} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {curPage > 1 && (
            <Link href={pageHref(curPage - 1) as any} rel="prev" className="px-3.5 py-2 rounded-xl text-sm text-white/70 bg-[#0A3658]/60 border border-[#1A6B9A]/30 hover:border-[#27C4A0]/50 hover:text-white transition-colors">← {PG.prev[L]}</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            n === curPage ? (
              <span key={n} aria-current="page" className="min-w-[40px] text-center px-3 py-2 rounded-xl text-sm font-bold bg-[#27C4A0] text-[#072D47]">{n}</span>
            ) : (
              <Link key={n} href={pageHref(n) as any} className="min-w-[40px] text-center px-3 py-2 rounded-xl text-sm text-white/70 bg-[#0A3658]/60 border border-[#1A6B9A]/30 hover:border-[#27C4A0]/50 hover:text-white transition-colors">{n}</Link>
            )
          ))}
          {curPage < totalPages && (
            <Link href={pageHref(curPage + 1) as any} rel="next" className="px-3.5 py-2 rounded-xl text-sm text-white/70 bg-[#0A3658]/60 border border-[#1A6B9A]/30 hover:border-[#27C4A0]/50 hover:text-white transition-colors">{PG.next[L]} →</Link>
          )}
        </nav>
      )}
    </div>
  );
}

function CatalogCard({ product, locale, t, tCat, installFrom }: { product: SupabaseProduct; locale: string; t: ReturnType<typeof useTranslations>; tCat: ReturnType<typeof useTranslations>; installFrom: number }) {
  const name = productName(product, locale);
  const energyCls = energyColors[product.energy_class] ?? 'text-gray-500 border-gray-300 bg-gray-100';

  return (
    <Link href={`/catalog/${product.id}` as any} className="catalog-card-hover bg-white rounded-2xl overflow-hidden flex flex-col group border border-[#e6edf3]" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
      <div className="relative rounded-t-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', paddingTop: '62%' }}>
        {productImages(product)[0] ? (
          <img src={productImages(product)[0]} alt={name} className="absolute inset-0 w-full h-full object-contain p-4" style={{ filter: 'drop-shadow(0 6px 12px rgba(15,23,42,0.10))' }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 opacity-20 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
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
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[#1A9A7A] text-xs font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="font-syne font-semibold text-sm text-gray-900 mb-2 leading-snug">{name}</h3>
        <div className="flex gap-3 mb-3">
          <span className="text-xs text-gray-400">{product.power_kw} kW</span>
          {product.area_coverage && (
            <span className="text-xs text-gray-400">
              {/telp/i.test(product.area_coverage)
                ? `${product.area_coverage.match(/\d+/)?.[0]} ${locale === 'ru' ? 'комн.' : locale === 'en' ? 'rooms' : 'telpas'}`
                : `${product.area_coverage.replace(/līdz/i, locale === 'ru' ? 'до' : locale === 'en' ? 'up to' : 'līdz')} m²`}
            </span>
          )}
        </div>
        <div className="border-t border-[#CDD5E0] pt-3 mt-auto">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              {!product.price ? (
                <span className="font-syne font-semibold text-sm text-gray-500">{t('priceOnRequest')}</span>
              ) : product.discount_percent ? (
                <>
                  <span className="text-xs text-gray-400 line-through mr-1.5">{product.price.toLocaleString('lv-LV')} €</span>
                  <span className="font-syne font-bold text-xl text-[#27C4A0]">
                    {Math.round(product.price * (1 - product.discount_percent / 100)).toLocaleString('lv-LV')} €
                  </span>
                </>
              ) : (
                <span className="font-syne font-bold text-xl text-gray-900">{product.price.toLocaleString('lv-LV')} €</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{tCat('installFrom', { price: installFrom })}</span>
          </div>
          <div className="w-full flex items-center justify-center gap-2 bg-[#E4EAF3] hover:bg-[#27C4A0] border border-[#CDD5E0] hover:border-[#27C4A0] text-[#3D5270] hover:text-[#072D47] font-semibold text-sm py-2 rounded-xl transition-all duration-200 group-hover:bg-[#27C4A0] group-hover:text-[#072D47] group-hover:border-[#27C4A0]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {tCat('viewBtn')}
          </div>
        </div>
      </div>
    </Link>
  );
}
