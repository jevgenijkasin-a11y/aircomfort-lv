import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { listProducts, getSettings, listCategories } from '@/lib/db';
import CatalogClient, { type CatalogCategory } from '@/components/CatalogClient';
import { jsonLdString } from '@/lib/productSeo';
import { toCards } from '@/lib/productCard';
import { listingMetadata, itemListJsonLd, paginate, parsePage, PAGE_WORD } from '@/lib/pagination';
import { asLoc, brandSlug, CATEGORY_SLUGS, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { visibleProducts } from '@/lib/catalogData';
import { hiddenKeys, descendantKeys, catName } from '@/lib/categories';
import { parseFilters, hasFilters, filterProducts } from '@/lib/catalogFilter';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

const DESC = {
  lv: 'Kondicionieru un siltumsūkņu katalogs: Daikin, Mitsubishi Electric, Hisense, Midea un citi. Cenas, jauda, energoefektivitāte un montāža visā Latvijā.',
  ru: 'Каталог кондиционеров и тепловых насосов: Daikin, Mitsubishi Electric, Hisense, Midea и другие. Цены, мощность, энергоэффективность и монтаж по всей Латвии.',
  en: 'Catalogue of air conditioners and heat pumps: Daikin, Mitsubishi Electric, Hisense, Midea and more. Prices, capacity, efficiency and installation across Latvia.',
};

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const l = asLoc(locale);
  const t = await getTranslations('catalog');
  const page = parsePage(sp.page);
  const filtered = hasFilters(parseFilters(sp));
  // Plain pagination pages are self-canonical; filtered/sorted views
  // canonicalize to the clean /catalog URL.
  const path = !filtered && page > 1 ? `/catalog?page=${page}` : '/catalog';
  return listingMetadata({
    locale,
    path,
    title: page > 1 ? `${t('title')} — ${PAGE_WORD[l]} ${page}` : t('title'),
    description: page > 1 ? `${DESC[l]} (${PAGE_WORD[l]} ${page})` : DESC[l],
  });
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
  // Filter, sort and page on the server: the browser only gets this page's cards
  const filtered = filterProducts(products, filters, categories);
  const page = parsePage(sp.page);
  const { items, totalPages, offset } = paginate(filtered, page);
  if (page > totalPages) notFound(); // no duplicate "last page" under other numbers
  const cards = toCards(items, locale);
  const slimCats: CatalogCategory[] = categories.map(({ key, parent_key, slug, name_lv, name_ru, name_en, sort_order, is_visible, is_system }) =>
    ({ key, parent_key, slug, name_lv, name_ru, name_en, sort_order, is_visible, is_system }));

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const cats = Object.keys(CATEGORY_SLUGS).filter((c) => products.some((p) => p.category === c));
  // Category landings managed in the admin (e.g. fan coils) — only with products
  const managed = categories.filter((c) => !c.is_system && products.some((p) => descendantKeys(categories, c.key).has(p.category)));
  const LBL = {
    brands: { lv: 'Zīmoli', ru: 'Бренды', en: 'Brands' },
    types: { lv: 'Kategorijas', ru: 'Категории', en: 'Categories' },
  };
  const chip = 'inline-block text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg px-3 py-1.5 rounded-xl transition-colors';

  return (
    <>
      <div className="pt-36 pb-10 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cool/10 blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">{t('title')}</p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-3">
            {t('title')}{page > 1 ? ` — ${PAGE_WORD[l]} ${page}` : ''}
          </h1>
          <p className="text-muted text-lg">{t('subtitle')}</p>
        </div>
      </div>
      {cards.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd(locale, cards, offset, t('title'))) }} />
      )}
      <CatalogClient
        cards={cards}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        brands={brands}
        categories={slimCats}
        locale={locale}
        initialFilters={filters}
        installFrom={installFrom}
      />

      {/* Crawlable hub links to brand and category landing pages */}
      {/* Hidden on phones (long chip lists under the pager); links stay in the HTML for crawlers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 hidden sm:grid gap-8 sm:grid-cols-2">
        <nav aria-label={LBL.types[l]}>
          <h2 className="text-muted text-xs font-semibold uppercase tracking-widest mb-3">{LBL.types[l]}</h2>
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
          <h2 className="text-muted text-xs font-semibold uppercase tracking-widest mb-3">{LBL.brands[l]}</h2>
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
