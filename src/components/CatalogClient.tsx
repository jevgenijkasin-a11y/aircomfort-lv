'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { CATALOG_PAGE_SIZE } from '@/lib/catalogData';
import { areaMax } from '@/lib/productSeo';

type Filters = { brand?: string; area?: string; category?: string; sort?: string; q?: string };

/** Room-area buckets (m², by the product's max served area). */
const AREA_BUCKETS: { id: string; min: number; max: number; label: string }[] = [
  { id: 'lt25', min: 0, max: 25, label: '≤ 25 m²' },
  { id: '25-35', min: 25, max: 35, label: '25–35 m²' },
  { id: '35-50', min: 35, max: 50, label: '35–50 m²' },
  { id: '50-70', min: 50, max: 70, label: '50–70 m²' },
  { id: '70plus', min: 70, max: Infinity, label: '70+ m²' },
];
const inBucket = (p: SupabaseProduct, id: string) => {
  const b = AREA_BUCKETS.find((x) => x.id === id);
  const a = areaMax(p);
  if (!b || a === null) return false;
  return b.id === 'lt25' ? a <= 25 : a > b.min && a <= b.max;
};
// Case- and diacritic-insensitive ("kondicionetajs" finds "kondicionētājs")
const norm = (s: string) => s.toLocaleLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const finalPrice = (p: SupabaseProduct) => (p.price ? (p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price) : 0);

const TXT = {
  search: { lv: 'Meklēt pēc nosaukuma vai modeļa', ru: 'Поиск по названию или модели', en: 'Search by name or model' },
  area: { lv: 'Telpas platība', ru: 'Площадь помещения', en: 'Room area' },
  anyArea: { lv: 'Jebkura', ru: 'Любая', en: 'Any' },
};

/** Grid of product cards (crawlable <a> links). Used by catalog, landing pages and "similar models". */
export function ProductGrid({ products, locale, installFrom = 250 }: { products: SupabaseProduct[]; locale: string; installFrom?: number }) {
  const t = useTranslations('catalog');
  const tp = useTranslations('products');
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
      </div>
      <p className="mt-4 text-xs text-white/60">{tp('installNote')}</p>
    </>
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
  const [area, setArea] = useState(initialFilters.area ?? '');
  const [query, setQuery] = useState(initialFilters.q ?? '');
  const [q, setQ] = useState(initialFilters.q ?? '');
  // Debounce typing → filter + URL update 250 ms after the last keystroke
  useEffect(() => { const id = setTimeout(() => setQ(query.trim()), 250); return () => clearTimeout(id); }, [query]);
  const [category, setCategory] = useState(initialFilters.category ?? '');
  const [sort, setSort] = useState(initialFilters.sort ?? 'asc');
  const [touched, setTouched] = useState(false);

  // Sync filter state to URL without triggering Next.js navigation (only
  // after the user changes a filter, so ?page=N links stay intact).
  useEffect(() => {
    if (!touched) return;
    const p = new URLSearchParams();
    if (brand) p.set('brand', brand);
    if (q) p.set('q', q);
    if (area) p.set('area', area);
    if (category) p.set('category', category);
    if (sort !== 'asc') p.set('sort', sort);
    const q = p.toString();
    window.history.replaceState(null, '', q ? `${pathname}?${q}` : pathname);
    sessionStorage.setItem('catalogParams', q);
  }, [brand, area, category, sort, q, touched, pathname]);

  const brands = useMemo(() => Array.from(new Set(initialProducts.map((p) => p.brand))), [initialProducts]);

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (brand) list = list.filter((p) => p.brand === brand);
    if (area) list = list.filter((p) => inBucket(p, area));
    if (q) {
      const needle = norm(q);
      list = list.filter((p) => norm([p.brand, p.name_lv, p.name_ru, p.name_en].join(' ')).includes(needle));
    }
    if (category) list = list.filter((p) => p.category === category);
    // 'Price on request' (no price) always last, whatever the direction
    list.sort((a, b) => {
      const pa = finalPrice(a), pb = finalPrice(b);
      if (!pa || !pb) return (pa ? 0 : 1) - (pb ? 0 : 1);
      return sort === 'asc' ? pa - pb : pb - pa;
    });
    return list;
  }, [initialProducts, brand, area, category, sort, q]);

  const reset = () => { setTouched(true); setBrand(''); setArea(''); setCategory(''); setSort('asc'); setQuery(''); setQ(''); };
  const change = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => { setTouched(true); fn(e.target.value); };

  // Unfiltered view → server pagination with real links. Filtered view → full filtered list.
  const unfiltered = !brand && !area && !category && !q && sort === 'asc';
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
        <div className="col-span-2 sm:col-span-4 relative">
          <label htmlFor="cat-search" className="sr-only">{TXT.search[L]}</label>
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            id="cat-search"
            type="search"
            value={query}
            onChange={(e) => { setTouched(true); setQuery(e.target.value); }}
            placeholder={TXT.search[L]}
            autoComplete="off"
            className="w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/50"
          />
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5 font-medium">{t('brand')}</label>
          <div className="relative">
            <select value={brand} onChange={change(setBrand)} className={selectCls}>
              <option value="">{t('allBrands')}</option>
              {brands.map((b) => <option key={b} value={b} style={{ background: '#0A3658' }}>{b}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label htmlFor="cat-area" className="block text-xs text-white/70 mb-1.5 font-medium">{TXT.area[L]}</label>
          <div className="relative">
            <select id="cat-area" value={area} onChange={change(setArea)} className={selectCls}>
              <option value="">{TXT.anyArea[L]}</option>
              {AREA_BUCKETS.map((b) => <option key={b.id} value={b.id} style={{ background: '#0A3658' }}>{b.label}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-1.5 font-medium">{t('category')}</label>
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
          <label className="block text-xs text-white/60 mb-1.5 font-medium">{t('sort')}</label>
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
        <p className="text-white/60 text-sm"><span className="text-white font-semibold">{filtered.length}</span> {t('results')}</p>
        {(brand || area || category || q) && (
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
          <p className="text-white/60 text-lg font-syne">{t('noResults')}</p>
          <p className="text-white/60 text-sm mt-1">{t('noResultsHint')}</p>
          <button onClick={reset} className="mt-5 text-[#27C4A0] text-sm font-semibold hover:text-white transition-colors">{t('resetFilters')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {shown.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
        </div>
      )}
      {filtered.length > 0 && <p className="mt-4 text-xs text-white/60">{tp('installNote')}</p>}

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
