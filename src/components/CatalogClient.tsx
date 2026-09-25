'use client';

import { Component, Fragment, useState, useMemo, useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { CATALOG_PAGE_SIZE } from '@/lib/catalogData';
import { type Category, categoryTree, catName } from '@/lib/categories';
import { KW_RANGES, PIPE_SYSTEMS, FAN_MOTORS } from '@/lib/fanCoil';
import {
  type Filters, AREA_BUCKETS, FAN_FILTER_KEYS, filterProducts, filtersQuery, fanFiltersActive, hasFilters,
} from '@/lib/catalogFilter';
import { starred } from '@/components/FootnoteStar';

const TXT = {
  search: { lv: 'Meklēt pēc nosaukuma vai modeļa', ru: 'Поиск по названию или модели', en: 'Search by name or model' },
  area: { lv: 'Telpas platība', ru: 'Площадь помещения', en: 'Room area' },
  anyArea: { lv: 'Jebkura', ru: 'Любая', en: 'Any' },
};

// Labels of the four original categories come from the site texts
const SYSTEM_LABEL: Record<string, string> = {
  home: 'catHome', heat_pump: 'catHeatPump', commercial: 'catCommercial', commercial_heat_pump: 'catCommercialHeatPump',
};

const selectCls = 'w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors appearance-none cursor-pointer';
const opt = { background: '#0A3658' };

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-white/60 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        {children}
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

/** Grid of product cards (crawlable <a> links). Used by catalog, landing pages and "similar models". */
export function ProductGrid({ products, locale, installFrom = 250 }: { products: SupabaseProduct[]; locale: string; installFrom?: number }) {
  const tp = useTranslations('products');
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
      </div>
      <p className="mt-4 text-xs text-white/60">{starred(tp('installNote'))}</p>
    </>
  );
}

type Props = {
  initialProducts: SupabaseProduct[];
  categories: Category[];
  locale: string;
  initialFilters?: Filters;
  page?: number;
  installFrom?: number;
};

/** Keeps a rendering error inside the catalog from blanking the whole page. */
class CatalogBoundary extends Component<{ children: ReactNode; fallback: (reset: () => void) => ReactNode; onReset: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('[catalog]', error); }
  reset = () => { this.props.onReset(); this.setState({ failed: false }); };
  render() { return this.state.failed ? this.props.fallback(this.reset) : this.props.children; }
}

export default function CatalogClient(props: Props) {
  const t = useTranslations('catalog');
  const pathname = usePathname();
  // After a crash + reset, remount with no filters on page 1
  const [generation, setGeneration] = useState(0);
  const reset = () => {
    try { sessionStorage.removeItem('catalogParams'); } catch { /* storage blocked */ }
    window.history.replaceState(null, '', pathname);
    setGeneration((g) => g + 1);
  };
  return (
    <CatalogBoundary
      onReset={reset}
      fallback={(retry) => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" role="alert">
          <p className="text-white text-lg font-syne">{t('errorTitle')}</p>
          <p className="text-white/60 text-sm mt-1">{t('errorHint')}</p>
          <button onClick={retry} className="mt-5 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            {t('resetFilters')}
          </button>
        </div>
      )}
    >
      <CatalogInner
        key={generation}
        {...props}
        initialFilters={generation ? {} : props.initialFilters}
        page={generation ? 1 : props.page}
      />
    </CatalogBoundary>
  );
}

function CatalogInner({
  initialProducts, categories, locale, initialFilters = {}, page: initialPage = 1, installFrom = 250,
}: Props) {
  const t = useTranslations('catalog');
  const tp = useTranslations('products');
  const pathname = usePathname();
  const L = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';

  // Initial state comes from the server (search params), so SSR HTML and the
  // hydrated client agree.
  const [filters, setFilters] = useState<Filters>({ sort: 'asc', ...initialFilters });
  const [query, setQuery] = useState(initialFilters.q ?? '');
  const [page, setPage] = useState(initialPage);
  const [touched, setTouched] = useState(false);
  // Pagination links navigate on the server; follow the new ?page=N
  useEffect(() => { setPage(initialPage); }, [initialPage]);

  const update = (patch: Filters) => {
    setTouched(true);
    setPage(1);
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      // Leaving the fan coil category drops its extra filters
      if (!fanFiltersActive(next, categories)) for (const k of FAN_FILTER_KEYS) delete next[k];
      return next;
    });
  };

  // Debounce typing → filter + URL update 250 ms after the last keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      const q = query.trim();
      if (q !== (filters.q ?? '')) update({ q });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Mirror filters in the URL without a Next.js navigation (only after the
  // user changed something, so server-rendered ?page=N links stay intact).
  useEffect(() => {
    if (!touched) return;
    const qs = filtersQuery(filters, page, categories);
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
    try { sessionStorage.setItem('catalogParams', qs); } catch { /* storage blocked */ }
  }, [filters, page, touched, pathname, categories]);

  const brands = useMemo(() => Array.from(new Set(initialProducts.map((p) => p.brand))).sort(), [initialProducts]);
  const tree = useMemo(() => categoryTree(categories), [categories]);
  const filtered = useMemo(() => filterProducts(initialProducts, filters, categories), [initialProducts, filters, categories]);
  const fan = fanFiltersActive(filters, categories);

  const resetAll = () => { setQuery(''); setTouched(true); setPage(1); setFilters({ sort: 'asc' }); };
  const select = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => update({ [k]: e.target.value });

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
  const curPage = Math.min(Math.max(1, page), totalPages);
  const shown = filtered.slice((curPage - 1) * CATALOG_PAGE_SIZE, curPage * CATALOG_PAGE_SIZE);
  const pageHref = (n: number) => {
    const qs = filtersQuery(filters, n, categories);
    return qs ? `/catalog?${qs}` : '/catalog';
  };
  const PG = {
    prev: { lv: 'Iepriekšējā', ru: 'Назад', en: 'Previous' },
    next: { lv: 'Nākamā', ru: 'Далее', en: 'Next' },
    label: { lv: 'Lapas', ru: 'Страницы', en: 'Pages' },
  };
  const catLabel = (c: Category) => (SYSTEM_LABEL[c.key] ? t(SYSTEM_LABEL[c.key]) : catName(c, L));

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
            onChange={(e) => setQuery(e.target.value)}
            placeholder={TXT.search[L]}
            autoComplete="off"
            className="w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/50"
          />
        </div>

        <Field id="cat-brand" label={t('brand')}>
          <select id="cat-brand" value={filters.brand ?? ''} onChange={select('brand')} className={selectCls}>
            <option value="">{t('allBrands')}</option>
            {brands.map((b) => <option key={b} value={b} style={opt}>{b}</option>)}
          </select>
        </Field>

        <Field id="cat-area" label={TXT.area[L]}>
          <select id="cat-area" value={filters.area ?? ''} onChange={select('area')} className={selectCls}>
            <option value="">{TXT.anyArea[L]}</option>
            {AREA_BUCKETS.map((b) => <option key={b.id} value={b.id} style={opt}>{b.label}</option>)}
          </select>
        </Field>

        <Field id="cat-category" label={t('category')}>
          <select id="cat-category" value={filters.category ?? ''} onChange={select('category')} className={selectCls}>
            <option value="">{t('allCategories')}</option>
            {tree.map(({ cat, children }) => (
              <Fragment key={cat.key}>
                <option value={cat.key} style={opt}>{catLabel(cat)}</option>
                {/* "Фанкоилы – Кассетные": the closed select shows the full path */}
                {children.map((ch) => <option key={ch.key} value={ch.key} style={opt}>{`${catLabel(cat)} – ${catLabel(ch)}`}</option>)}
              </Fragment>
            ))}
          </select>
        </Field>

        <Field id="cat-sort" label={t('sort')}>
          <select id="cat-sort" value={filters.sort ?? 'asc'} onChange={select('sort')} className={selectCls}>
            <option value="asc" style={opt}>{t('sortAsc')}</option>
            <option value="desc" style={opt}>{t('sortDesc')}</option>
          </select>
        </Field>

        {fan && (
          <>
            <Field id="cat-pipes" label={t('pipes')}>
              <select id="cat-pipes" value={filters.pipes ?? ''} onChange={select('pipes')} className={selectCls}>
                <option value="">{t('any')}</option>
                {PIPE_SYSTEMS.map((v) => <option key={v} value={v} style={opt}>{t(`pipes${v}`)}</option>)}
              </select>
            </Field>
            <Field id="cat-motor" label={t('motor')}>
              <select id="cat-motor" value={filters.motor ?? ''} onChange={select('motor')} className={selectCls}>
                <option value="">{t('any')}</option>
                {FAN_MOTORS.map((v) => <option key={v} value={v} style={opt}>{v}</option>)}
              </select>
            </Field>
            <Field id="cat-cool" label={t('cooling')}>
              <select id="cat-cool" value={filters.cool ?? ''} onChange={select('cool')} className={selectCls}>
                <option value="">{t('any')}</option>
                {KW_RANGES.map((r) => <option key={r.id} value={r.id} style={opt}>{r.label}</option>)}
              </select>
            </Field>
            <Field id="cat-heat" label={t('heating')}>
              <select id="cat-heat" value={filters.heat ?? ''} onChange={select('heat')} className={selectCls}>
                <option value="">{t('any')}</option>
                {KW_RANGES.map((r) => <option key={r.id} value={r.id} style={opt}>{r.label}</option>)}
              </select>
            </Field>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-white/60 text-sm"><span className="text-white font-semibold">{filtered.length}</span> {t('results')}</p>
        {(hasFilters(filters) || query) && (
          <button onClick={resetAll} className="text-[#27C4A0] text-sm hover:text-white transition-colors flex items-center gap-1.5">
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
          <button onClick={resetAll} className="mt-5 text-[#27C4A0] text-sm font-semibold hover:text-white transition-colors">{t('resetFilters')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {shown.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
        </div>
      )}
      {filtered.length > 0 && <p className="mt-4 text-xs text-white/60">{starred(tp('installNote'))}</p>}

      {/* Pagination — real <a href> links that keep the active filters */}
      {totalPages > 1 && (
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
