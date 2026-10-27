// Category page: /catalog/<slug> and /catalog/<parent>/<sub>.
// H1 / title / description / intro come from the category's SEO fields in the
// admin, otherwise from a template; the catalog filters (brand, area, search,
// fan coil fields) work inside the category as query parameters, while the
// canonical URL stays the clean category page.
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listProducts, getSettings, listCategories } from '@/lib/db';
import { visibleProducts } from '@/lib/catalogData';
import { BASE_URL } from '@/lib/seo';
import { asLoc, brandSlug, breadcrumbJsonLd, jsonLdString, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { type Category, type Loc, catName, descendantKeys, hiddenKeys, categoryBySegments, categoryPath } from '@/lib/categories';
import { stats, categoryIntro, categoryMeta } from '@/lib/landing';
import { listingMetadata, itemListJsonLd, paginate, parsePage, pageSuffix } from '@/lib/pagination';
import { parseFilters, hasFilters, filterProducts } from '@/lib/catalogFilter';
import { toCards } from '@/lib/productCard';
import CatalogClient, { type CatalogCategory } from '@/components/CatalogClient';

type SP = Record<string, string | string[] | undefined>;
type Messages = (key: string) => string;

const H1_TEMPLATE: Record<Loc, (name: string) => string> = {
  lv: (n) => `${n} — cenas ar montāžu`,
  ru: (n) => `${n} — цены с монтажом`,
  en: (n) => `${n} — prices with installation`,
};
const TXT = {
  brands: { lv: 'Populāri zīmoli', ru: 'Популярные бренды', en: 'Popular brands' },
  related: { lv: 'Citas kategorijas', ru: 'Другие категории', en: 'Other categories' },
  sub: { lv: 'Apakškategorijas', ru: 'Подкатегории', en: 'Subcategories' },
};

/** Public name: the four original categories take theirs from the site texts. */
export const categoryLabel = (c: Category, l: Loc, tc: Messages) =>
  (c.is_system && CATEGORY_MSG_KEY[c.key] ? tc(CATEGORY_MSG_KEY[c.key]) : '') || catName(c, l);

async function load(segments: string[]) {
  const cats = listCategories();
  const hidden = hiddenKeys(cats);
  const cat = categoryBySegments(cats, segments);
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const visible = visibleProducts(all, hidden);
  const keys = cat ? descendantKeys(cats, cat.key) : new Set<string>();
  const products = visible.filter((p) => keys.has(p.category));
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  return { cats, hidden, cat: cat && !hidden.has(cat.key) ? cat : null, products, visible, installFrom };
}

/** Brands of the products, most models first. */
const brandsByCount = (list: { brand: string }[]) =>
  Object.entries(list.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.brand]: (acc[p.brand] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([b]) => b);

function texts(cat: Category, l: Loc, tc: Messages, products: Parameters<typeof stats>[0], installFrom: number) {
  const label = categoryLabel(cat, l, tc);
  const h1 = cat[`seo_h1_${l}`]?.trim() || H1_TEMPLATE[l](label);
  const s = stats(products);
  const generated = products.length ? categoryMeta(label, s, l, installFrom) : null;
  const siteDesc = cat.is_system && CATEGORY_MSG_KEY[cat.key] ? tc(`${CATEGORY_MSG_KEY[cat.key]}Desc`) : '';
  const manualIntro = (cat[`seo_intro_${l}`] || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const intro = manualIntro.length ? manualIntro
    : products.length ? categoryIntro(label, siteDesc || cat[`seo_description_${l}`] || '', s, brandsByCount(products), l, installFrom).filter(Boolean)
    : [siteDesc || cat[`seo_description_${l}`] || ''].filter(Boolean);
  return {
    label,
    h1,
    title: cat[`seo_title_${l}`]?.trim() || h1,
    description: cat[`seo_description_${l}`]?.trim() || generated?.description || siteDesc,
    intro,
  };
}

export async function categoryListingMetadata(locale: string, segments: string[], sp: SP): Promise<Metadata> {
  const l = asLoc(locale);
  const { cat, products, installFrom } = await load(segments);
  if (!cat) return { title: 'AirComfort', robots: { index: false } };
  const tc = await getTranslations({ locale, namespace: 'categories' });
  const { title, description } = texts(cat, l, tc, products, installFrom);
  const base = categoryPath(listCategories(), cat.key);
  const page = parsePage(sp.page);
  // Filtered / sorted views → canonical is the clean category page; plain ?page=N is self-canonical
  const filtered = hasFilters({ ...parseFilters(sp), category: undefined });
  const path = !filtered && page > 1 ? `${base}?page=${page}` : base;
  return {
    ...listingMetadata({
      locale,
      path,
      title: title + pageSuffix(page, l),
      description: page > 1 && description ? `${description}${pageSuffix(page, l).replace(' — ', ' (')})` : description,
    }),
    // Empty sections stay reachable but out of the index until they have products
    ...(products.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryListing({ locale, segments, sp }: { locale: string; segments: string[]; sp: SP }) {
  const l = asLoc(locale);
  const [{ cats, hidden, cat, products, visible, installFrom }, tn, tc, t] = await Promise.all([
    load(segments), getTranslations('nav'), getTranslations('categories'), getTranslations('catalog'),
  ]);
  if (!cat) notFound();
  const base = categoryPath(cats, cat.key);
  // One address per category: /catalog/fan-coils-cassette → /catalog/fan-coils/cassette
  if (`/catalog/${segments.join('/')}` !== base) {
    const qs = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((x) => [k, x])))).toString();
    permanentRedirect(`/${locale}${base}${qs ? `?${qs}` : ''}`);
  }

  const filters = { ...parseFilters(sp), category: cat.key };
  const visibleCats = cats.filter((c) => !hidden.has(c.key));
  const filtered = filterProducts(visible, filters, visibleCats);
  const page = parsePage(sp.page);
  const { items, totalPages, offset } = paginate(filtered, page);
  if (page > totalPages) notFound();
  const cards = toCards(items, locale);
  const { label, h1, intro } = texts(cat, l, tc, products, installFrom);
  const brands = brandsByCount(products);

  // Neighbours: subcategories, the parent and its other children, other top-level sections with products
  const withProducts = (c: Category) => visible.some((p) => descendantKeys(cats, c.key).has(p.category));
  const parent = cat.parent_key ? visibleCats.find((c) => c.key === cat.parent_key) ?? null : null;
  const children = visibleCats.filter((c) => c.parent_key === cat.key && withProducts(c));
  const neighbours = [
    ...(parent ? [parent, ...visibleCats.filter((c) => c.parent_key === parent.key && c.key !== cat.key)] : []),
    ...visibleCats.filter((c) => !c.parent_key && c.key !== cat.key && c.key !== parent?.key),
  ].filter(withProducts);

  const crumbs = [
    { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
    { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
    ...(parent ? [{ name: categoryLabel(parent, l, tc), href: categoryPath(cats, parent.key), url: `${BASE_URL}/${locale}${categoryPath(cats, parent.key)}` }] : []),
    { name: label, href: null, url: `${BASE_URL}/${locale}${base}` },
  ];
  const slimCats: CatalogCategory[] = visibleCats.map(({ key, parent_key, slug, name_lv, name_ru, name_en, sort_order, is_visible, is_system }) =>
    ({ key, parent_key, slug, name_lv, name_ru, name_en, sort_order, is_visible, is_system }));
  const chip = 'inline-block text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg px-3 py-1.5 rounded-xl transition-colors';
  const h1Full = h1 + pageSuffix(page, l);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd(crumbs.map(({ name, url }) => ({ name, url })))) }} />
      {cards.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd(locale, cards, offset, h1)) }} />
      )}
      <div className="pt-36 pb-6 md:pb-8 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href as any} className="hover:text-primary transition-colors">{c.name}</Link>
                  ) : (
                    <span className="text-muted" aria-current="page">{c.name}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl mb-4">{h1Full}</h1>
          {/* The intro belongs to page 1; further pages are plain product lists */}
          {page === 1 && intro.length > 0 && (
            <div className="max-w-3xl space-y-3">
              {intro.map((p, i) => <p key={i} className="text-muted text-base leading-relaxed">{p}</p>)}
            </div>
          )}
          {children.length > 0 && (
            <nav aria-label={TXT.sub[l]} className="mt-5">
              <ul className="flex flex-wrap gap-2">
                {children.map((c) => (
                  <li key={c.key}><Link href={categoryPath(cats, c.key) as any} className={chip}>{categoryLabel(c, l, tc)}</Link></li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      <CatalogClient
        cards={cards}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        brands={brands.slice().sort()}
        categories={slimCats}
        locale={locale}
        initialFilters={filters}
        installFrom={installFrom}
        emptyText={products.length ? undefined : t('categoryEmpty')}
      />

      {/* Hub links: brands of this category and neighbouring sections (on phones hidden; links stay in the HTML) */}
      {(brands.length > 0 || neighbours.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 hidden sm:grid gap-8 sm:grid-cols-2">
          {brands.length > 0 && (
            <nav aria-label={TXT.brands[l]}>
              <h2 className="text-muted text-xs font-semibold uppercase tracking-widest mb-3">{TXT.brands[l]}</h2>
              <ul className="flex flex-wrap gap-2">
                {brands.map((b) => <li key={b}><Link href={`/catalog/brand/${brandSlug(b)}` as any} className={chip}>{b}</Link></li>)}
              </ul>
            </nav>
          )}
          {neighbours.length > 0 && (
            <nav aria-label={TXT.related[l]}>
              <h2 className="text-muted text-xs font-semibold uppercase tracking-widest mb-3">{TXT.related[l]}</h2>
              <ul className="flex flex-wrap gap-2">
                {neighbours.map((c) => <li key={c.key}><Link href={categoryPath(cats, c.key) as any} className={chip}>{categoryLabel(c, l, tc)}</Link></li>)}
              </ul>
            </nav>
          )}
        </div>
      )}
    </>
  );
}
