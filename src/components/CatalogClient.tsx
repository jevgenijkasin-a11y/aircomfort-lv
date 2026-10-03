'use client';

// Catalog filters + one page of results. Filtering, sorting and paging run on
// the server (lib/catalogFilter): a filter change replaces the URL query and
// the server renders the next 24 cards, so the browser never receives the
// whole product base.
import { Component, Fragment, useState, useEffect, useRef, useTransition, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import ProductCard from '@/components/ProductCard';
import type { CardProduct } from '@/lib/productCard';
import { type Category, categoryTree, catName } from '@/lib/categories';
import { KW_RANGES, PIPE_SYSTEMS, FAN_MOTORS } from '@/lib/fanCoil';
import { type Filters, AREA_BUCKETS, AREA_EXTRA, AREA_CHIPS, FAN_FILTER_KEYS, filtersQuery, fanFiltersActive, hasFilters } from '@/lib/catalogFilter';
import Sheet from '@/components/Sheet';
import ViewToggle from '@/components/ViewToggle';
import { starred } from '@/components/FootnoteStar';
import { pageItems } from '@/lib/pagination';

/** Fields of a category the filters need (the rest stays on the server). */
export type CatalogCategory = Pick<Category, 'key' | 'parent_key' | 'slug' | 'name_lv' | 'name_ru' | 'name_en' | 'sort_order' | 'is_visible' | 'is_system'>;

const TXT = {
  search: { lv: 'Meklēt pēc nosaukuma vai modeļa', ru: 'Поиск по названию или модели', en: 'Search by name or model' },
  area: { lv: 'Telpas platība', ru: 'Площадь помещения', en: 'Room area' },
  anyArea: { lv: 'Jebkura', ru: 'Любая', en: 'Any' },
};

// Labels of the four original categories come from the site texts
const SYSTEM_LABEL: Record<string, string> = {
  home: 'catHome', heat_pump: 'catHeatPump', commercial: 'catCommercial', commercial_heat_pump: 'catCommercialHeatPump',
};

const selectCls = 'w-full bg-surface border border-line text-fg text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer';
// native <option> popups need an explicit themed background
const opt = { background: 'rgb(var(--card))' };

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-muted mb-1.5 font-medium">{label}</label>
      <div className="relative">
        {children}
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/70 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

type Props = {
  /** Cards of the current page only */
  cards: CardProduct[];
  /** Number of products matching the filters */
  total: number;
  page: number;
  totalPages: number;
  brands: string[];
  categories: CatalogCategory[];
  locale: string;
  initialFilters?: Filters;
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
  const router = useRouter();
  // After a crash + reset, remount with no filters on page 1
  const [generation, setGeneration] = useState(0);
  const reset = () => {
    try { sessionStorage.removeItem('catalogParams'); } catch { /* storage blocked */ }
    router.replace(pathname, { scroll: false });
    setGeneration((g) => g + 1);
  };
  return (
    <CatalogBoundary
      onReset={reset}
      fallback={(retry) => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" role="alert">
          <p className="text-fg text-lg font-heading">{t('errorTitle')}</p>
          <p className="text-muted text-sm mt-1">{t('errorHint')}</p>
          <button onClick={retry} className="mt-5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            {t('resetFilters')}
          </button>
        </div>
      )}
    >
      <CatalogInner key={generation} {...props} initialFilters={generation ? {} : props.initialFilters} />
    </CatalogBoundary>
  );
}

const sameFilters = (a: Filters, b: Filters, cats: Category[]) => filtersQuery(a, 1, cats) === filtersQuery(b, 1, cats);

function CatalogInner({
  cards, total, page, totalPages, brands, categories: slimCats, locale, initialFilters = {}, installFrom = 250,
}: Props) {
  const t = useTranslations('catalog');
  const tp = useTranslations('products');
  const ts = useTranslations('shop');
  const [sheet, setSheet] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const L = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';
  // The helpers only read key / parent / names / order of a category
  const categories = slimCats as Category[];

  const [filters, setFilters] = useState<Filters>({ sort: 'asc', ...initialFilters });
  const [query, setQuery] = useState(initialFilters.q ?? '');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Browser back/forward (or a link) changed the URL → take the filters from it
  useEffect(() => {
    if (!sameFilters(initialFilters, filtersRef.current, categories)) {
      setFilters({ sort: 'asc', ...initialFilters });
      setQuery(initialFilters.q ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersQuery(initialFilters, 1, categories)]);

  // Remember the current listing for the product page's "Back to catalog"
  useEffect(() => {
    try { sessionStorage.setItem('catalogParams', filtersQuery(initialFilters, page, categories)); } catch { /* storage blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersQuery(initialFilters, page, categories)]);

  const navigate = (next: Filters) => {
    const qs = filtersQuery(next, 1, categories);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const update = (patch: Filters) => {
    const next = { ...filtersRef.current, ...patch };
    // Leaving the fan coil category drops its extra filters
    if (!fanFiltersActive(next, categories)) for (const k of FAN_FILTER_KEYS) delete next[k];
    setFilters(next);
    navigate(next);
  };

  // Debounce typing → server search 300 ms after the last keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      const q = query.trim();
      if (q !== (filtersRef.current.q ?? '')) update({ q });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const tree = categoryTree(categories);
  const fan = fanFiltersActive(filters, categories);
  const resetAll = () => { setQuery(''); const next = { sort: 'asc' }; setFilters(next); navigate(next); };
  const select = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => update({ [k]: e.target.value });

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
  // Active filters (sorting does not count) — "Filters (N)" on phones
  const activeCount = (['brand', 'area', 'category', 'q', 'pipes', 'motor', 'cool', 'heat'] as const).filter((k) => !!filters[k]).length;
  const chipLabel = (id: string) => (id === 'lt25' ? ts('upTo', { n: 25 }) : id === '50plus' ? '50+' : id.replace('-', '–'));
  const sortSelect = (id: string, cls: string) => (
    <select id={id} value={filters.sort ?? 'asc'} onChange={select('sort')} className={cls}>
      <option value="asc" style={opt}>{t('sortAsc')}</option>
      <option value="desc" style={opt}>{t('sortDesc')}</option>
    </select>
  );

  /** Search + brand / area / category (+ fan coil fields). `p` keeps ids unique (desktop / sheet). */
  const fields = (p: string) => (
    <>
      <div className="col-span-2 sm:col-span-4 relative">
        <label htmlFor={`${p}search`} className="sr-only">{TXT.search[L]}</label>
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          id={`${p}search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={TXT.search[L]}
          autoComplete="off"
          className="w-full bg-surface border border-line text-fg text-base md:text-sm pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent/50 transition-colors placeholder-muted"
        />
      </div>

      <Field id={`${p}brand`} label={t('brand')}>
        <select id={`${p}brand`} value={filters.brand ?? ''} onChange={select('brand')} className={selectCls}>
          <option value="">{t('allBrands')}</option>
          {brands.map((b) => <option key={b} value={b} style={opt}>{b}</option>)}
        </select>
      </Field>

      <Field id={`${p}area`} label={TXT.area[L]}>
        <select id={`${p}area`} value={filters.area ?? ''} onChange={select('area')} className={selectCls}>
          <option value="">{TXT.anyArea[L]}</option>
          {AREA_BUCKETS.map((b) => <option key={b.id} value={b.id} style={opt}>{b.label}</option>)}
          {/* "50+" comes from the phone chips */}
          {AREA_EXTRA.filter((b) => b.id === filters.area).map((b) => <option key={b.id} value={b.id} style={opt}>{b.label}</option>)}
        </select>
      </Field>

      <Field id={`${p}category`} label={t('category')}>
        <select id={`${p}category`} value={filters.category ?? ''} onChange={select('category')} className={selectCls}>
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

      {fan && (
        <>
          <Field id={`${p}pipes`} label={t('pipes')}>
            <select id={`${p}pipes`} value={filters.pipes ?? ''} onChange={select('pipes')} className={selectCls}>
              <option value="">{t('any')}</option>
              {PIPE_SYSTEMS.map((v) => <option key={v} value={v} style={opt}>{t(`pipes${v}`)}</option>)}
            </select>
          </Field>
          <Field id={`${p}motor`} label={t('motor')}>
            <select id={`${p}motor`} value={filters.motor ?? ''} onChange={select('motor')} className={selectCls}>
              <option value="">{t('any')}</option>
              {FAN_MOTORS.map((v) => <option key={v} value={v} style={opt}>{v}</option>)}
            </select>
          </Field>
          <Field id={`${p}cool`} label={t('cooling')}>
            <select id={`${p}cool`} value={filters.cool ?? ''} onChange={select('cool')} className={selectCls}>
              <option value="">{t('any')}</option>
              {KW_RANGES.map((r) => <option key={r.id} value={r.id} style={opt}>{r.label}</option>)}
            </select>
          </Field>
          <Field id={`${p}heat`} label={t('heating')}>
            <select id={`${p}heat`} value={filters.heat ?? ''} onChange={select('heat')} className={selectCls}>
              <option value="">{t('any')}</option>
              {KW_RANGES.map((r) => <option key={r.id} value={r.id} style={opt}>{r.label}</option>)}
            </select>
          </Field>
        </>
      )}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Desktop / tablet: the filter panel as before */}
      <div className="hidden md:grid glass-card rounded-2xl p-5 mb-8 grid-cols-4 gap-4">
        {fields('cat-')}
        <Field id="cat-sort" label={t('sort')}>{sortSelect('cat-sort', selectCls)}</Field>
      </div>

      {/* Phones: "Filters (N)" + sorting + view switch, sticky under the header */}
      <div className="md:hidden sticky top-20 z-30 -mx-4 px-4 py-2 bg-page/95 backdrop-blur-md border-b border-line">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog"
            className={`flex-shrink-0 inline-flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl border text-sm font-semibold transition-colors ${activeCount ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-fg border-line'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden><path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4" /></svg>
            {activeCount ? ts('filtersN', { n: activeCount }) : ts('filters')}
          </button>
          <div className="relative flex-1 min-w-0">
            <label htmlFor="m-sort" className="sr-only">{ts('sort')}</label>
            {sortSelect('m-sort', `${selectCls} min-h-[44px] pr-8`)}
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/70 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <ViewToggle />
        </div>
        {/* Area chips */}
        <div role="group" aria-label={ts('areaChips')} className="no-scrollbar -mx-4 px-4 mt-2 flex gap-2 overflow-x-auto">
          {AREA_CHIPS.map((id) => {
            const on = filters.area === id;
            return (
              <button key={id} type="button" aria-pressed={on} onClick={() => update({ area: on ? '' : id })}
                className={`flex-shrink-0 min-h-[36px] px-3.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors ${on ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-fg border-line'}`}>
                {chipLabel(id)}
              </button>
            );
          })}
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title={ts('filters')} closeLabel={ts('close')}
        footer={
          <div className="flex gap-3">
            {activeCount > 0 && (
              <button type="button" onClick={resetAll} className="min-h-[48px] px-4 rounded-xl border border-line text-sm font-semibold text-fg">{t('resetFilters')}</button>
            )}
            <button type="button" onClick={() => setSheet(false)} disabled={pending}
              className="flex-1 min-h-[48px] rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors disabled:opacity-70">
              {ts('showN', { n: total })}
            </button>
          </div>
        }>
        <div className="flex flex-col gap-4">{fields('m-')}</div>
      </Sheet>

      <div className="flex items-center justify-between mt-4 md:mt-0 mb-4 md:mb-6">
        <p className="text-muted text-sm" aria-live="polite"><span className="text-fg font-semibold">{total}</span> {t('results')}</p>
        {(hasFilters(filters) || query) && (
          <button onClick={resetAll} className="text-primary text-sm hover:text-fg transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {t('resetFilters')}
          </button>
        )}
      </div>

      <div className={`transition-opacity duration-200 ${pending ? 'opacity-50' : ''}`} aria-busy={pending}>
        {total === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-muted text-lg font-heading">{t('noResults')}</p>
            <p className="text-muted text-sm mt-1">{t('noResultsHint')}</p>
            <button onClick={resetAll} className="mt-5 text-primary text-sm font-semibold hover:text-fg transition-colors">{t('resetFilters')}</button>
          </div>
        ) : (
          <div className="product-grid grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
          </div>
        )}
      </div>
      {total > 0 && <p className="hidden md:block mt-4 text-xs text-muted">{starred(tp('installNote'))}</p>}

      {/* Pagination — real <a href> links that keep the active filters */}
      {totalPages > 1 && (
        <nav aria-label={PG.label[L]} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1) as any} rel="prev" className="px-3.5 py-2 rounded-xl text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg transition-colors">← {PG.prev[L]}</Link>
          )}
          {/* On phones: 1 2 3 … current … last (all numbers stay in the HTML) */}
          {pageItems(page, totalPages).map((it, i) => (
            'gap' in it ? (
              <span key={`g${i}`} aria-hidden="true" className="sm:hidden px-1 text-muted">…</span>
            ) : it.n === page ? (
              <span key={it.n} aria-current="page" className="min-w-[40px] text-center px-3 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary">{it.n}</span>
            ) : (
              <Link key={it.n} href={pageHref(it.n) as any} className={`min-w-[40px] text-center px-3 py-2 rounded-xl text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg transition-colors ${it.compact ? '' : 'hidden sm:inline-block'}`}>{it.n}</Link>
            )
          ))}
          {page < totalPages && (
            <Link href={pageHref(page + 1) as any} rel="next" className="px-3.5 py-2 rounded-xl text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg transition-colors">{PG.next[L]} →</Link>
          )}
        </nav>
      )}
    </div>
  );
}
