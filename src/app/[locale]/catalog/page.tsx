import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { listProducts, getSettings, listCategories } from '@/lib/db';
import CatalogClient from '@/components/CatalogClient';
import { localizedAlternates } from '@/lib/seo';
import { asLoc, brandSlug, CATEGORY_SLUGS, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { visibleProducts, CATALOG_PAGE_SIZE } from '@/lib/catalogData';
import { hiddenKeys, descendantKeys, catName } from '@/lib/categories';
import { parseFilters, hasFilters, filterProducts } from '@/lib/catalogFilter';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

const parsePage = (v?: string | string[]) => {
  const n = parseInt((Array.isArray(v) ? v[0] : v) || '1', 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
};

const DESC = {
  lv: 'Kondicionieru un siltumsūkņu katalogs: Daikin, Mitsubishi Electric, Hisense, Midea un citi. Cenas, jauda, energoefektivitāte un montāža visā Latvijā.',
  ru: 'Каталог кондиционеров и тепловых насосов: Daikin, Mitsubishi Electric, Hisense, Midea и другие. Цены, мощность, энергоэффективность и монтаж по всей Латвии.',
  en: 'Catalogue of air conditioners and heat pumps: Daikin, Mitsubishi Electric, Hisense, Midea and more. Prices, capacity, efficiency and installation across Latvia.',
};
const PAGE_WORD = { lv: 'lapa', ru: 'страница', en: 'page' };

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const l = asLoc(locale);
  const t = await getTranslations('catalog');
  const page = parsePage(sp.page);
  const filtered = hasFilters(parseFilters(sp));
  // Plain pagination pages are self-canonical; filtered/sorted views
  // canonicalize to the clean /catalog URL.
  const path = !filtered && page > 1 ? `/catalog?page=${page}` : '/catalog';
  return {
    title: page > 1 ? `${t('title')} — ${PAGE_WORD[l]} ${page}` : t('title'),
    description: page > 1 ? `${DESC[l]} (${PAGE_WORD[l]} ${page})` : DESC[l],
    alternates: localizedAlternates(locale, path),
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = asLoc(locale);

  const [t, tc, all, sp, settings] = await Promise.all([
    getTranslations('catalog'),
    getTranslations('categories'),
    listProducts({ inStockOnly: true, orderBy: 'price' }),
    searchParams,
    getSettings(),
  ]);
  const allCats = listCategories();
  const hidden = hiddenKeys(allCats);
  const categories = allCats.filter((c) => !hidden.has(c.key));
  const products = visibleProducts(all, hidden);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;

  const filters = parseFilters(sp);
  // Unknown or hidden category in the URL → show everything instead of an empty list
  if (filters.category && !categories.some((c) => c.key === filters.category)) delete filters.category;
  const count = filterProducts(products, filters, categories).length;
  const totalPages = Math.max(1, Math.ceil(count / CATALOG_PAGE_SIZE));
  const page = parsePage(sp.page);
  if (page > totalPages) notFound(); // no duplicate "last page" under other numbers

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const cats = Object.keys(CATEGORY_SLUGS).filter((c) => products.some((p) => p.category === c));
  // Category landings managed in the admin (e.g. fan coils) — only with products
  const managed = categories.filter((c) => !c.is_system && products.some((p) => descendantKeys(categories, c.key).has(p.category)));
  const LBL = {
    brands: { lv: 'Zīmoli', ru: 'Бренды', en: 'Brands' },
    types: { lv: 'Kategorijas', ru: 'Категории', en: 'Categories' },
  };
  const chip = 'inline-block text-sm text-white/70 bg-[#0A3658]/60 border border-[#1A6B9A]/30 hover:border-[#27C4A0]/50 hover:text-white px-3 py-1.5 rounded-xl transition-colors';

  return (
    <>
      <div className="pt-36 pb-10 bg-gradient-to-b from-[#051e31] to-[#072D47] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#1A6B9A]/10 blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-[#27C4A0] text-sm font-semibold uppercase tracking-widest mb-3">{t('title')}</p>
          <h1 className="font-syne font-bold text-4xl sm:text-5xl mb-3">
            {t('title')}{page > 1 ? ` — ${PAGE_WORD[l]} ${page}` : ''}
          </h1>
          <p className="text-white/60 text-lg">{t('subtitle')}</p>
        </div>
      </div>
      <CatalogClient
        initialProducts={products}
        categories={categories}
        locale={locale}
        initialFilters={filters}
        page={page}
        installFrom={installFrom}
      />

      {/* Crawlable hub links to brand and category landing pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid gap-8 sm:grid-cols-2">
        <nav aria-label={LBL.types[l]}>
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">{LBL.types[l]}</h2>
          <ul className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <li key={c}>
                <Link href={`/catalog/type/${CATEGORY_SLUGS[c]}` as any} className={chip}>{tc(CATEGORY_MSG_KEY[c])}</Link>
              </li>
            ))}
            {managed.map((c) => (
              <li key={c.key}>
                <Link href={`/catalog/category/${c.slug}` as any} className={chip}>{catName(c, l)}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={LBL.brands[l]}>
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">{LBL.brands[l]}</h2>
          <ul className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <li key={b}>
                <Link href={`/catalog/brand/${brandSlug(b)}` as any} className={chip}>{b}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
