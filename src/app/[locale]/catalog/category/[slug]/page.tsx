export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listProducts, getSettings, listCategories } from '@/lib/db';
import { visibleProducts, pricedFirst } from '@/lib/catalogData';
import { BASE_URL } from '@/lib/seo';
import { asLoc } from '@/lib/productSeo';
import { type Category, type Loc, catName, descendantKeys, hiddenKeys } from '@/lib/categories';
import { listingMetadata, pageFromSearch, pagePath, pageSuffix, paginate } from '@/lib/pagination';
import LandingView from '@/components/LandingView';

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<SP> };

/** Category landing pages managed in Admin → Categories (e.g. fan coils). */
async function load(slug: string) {
  const cats = listCategories();
  const hidden = hiddenKeys(cats);
  const cat = cats.find((c) => c.slug === slug) ?? null;
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const keys = cat ? descendantKeys(cats, cat.key) : new Set<string>();
  const products = pricedFirst(visibleProducts(all, hidden).filter((p) => keys.has(p.category)));
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  const visible = cats.filter((c) => !hidden.has(c.key));
  return { cat: cat && !hidden.has(cat.key) ? cat : null, products, installFrom, visible };
}

const h1Of = (c: Category, l: Loc) => c[`seo_h1_${l}`] || catName(c, l);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  const l = asLoc(locale);
  const { cat, products } = await load(slug);
  if (!cat) return { title: 'AirComfort' };
  const page = pageFromSearch(sp);
  const description = cat[`seo_description_${l}`] || '';
  return {
    ...listingMetadata({
      locale,
      path: pagePath(`/catalog/category/${slug}`, page),
      title: (cat[`seo_title_${l}`] || h1Of(cat, l)) + pageSuffix(page, l),
      description: page > 1 && description ? `${description}${pageSuffix(page, l).replace(' — ', ' (')})` : description,
    }),
    // Empty sections are reachable but kept out of the index until they have products
    ...(products.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function ManagedCategoryPage({ params, searchParams }: Props) {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [{ cat, products, installFrom, visible }, tn, t] = await Promise.all([
    load(slug), getTranslations('nav'), getTranslations('catalog'),
  ]);
  if (!cat) notFound();
  // The original four categories live under /catalog/type/*
  if (cat.is_system) permanentRedirect(`/${locale}/catalog/type/${cat.slug}`);
  const page = pageFromSearch(sp);
  const { items, totalPages, offset } = paginate(products, page);
  if (page > totalPages) notFound();
  const base = `/catalog/category/${cat.slug}`;

  const parent = cat.parent_key ? visible.find((c) => c.key === cat.parent_key) ?? null : null;
  const children = visible.filter((c) => c.parent_key === cat.key);
  const siblings = parent ? visible.filter((c) => c.parent_key === parent.key && c.key !== cat.key) : [];
  const link = (c: Category) => ({ href: `/catalog/category/${c.slug}`, label: catName(c, l) });
  const related = [...children, ...(parent ? [parent] : []), ...siblings].map(link);
  const intro = (cat[`seo_intro_${l}`] || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <LandingView
      locale={locale}
      h1={h1Of(cat, l) + pageSuffix(page, l)}
      intro={intro}
      products={items}
      page={page}
      totalPages={totalPages}
      offset={offset}
      basePath={base}
      installFrom={installFrom}
      emptyText={t('categoryEmpty')}
      crumbs={[
        { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
        { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
        ...(parent ? [{ name: catName(parent, l), href: `/catalog/category/${parent.slug}`, url: `${BASE_URL}/${locale}/catalog/category/${parent.slug}` }] : []),
        { name: catName(cat, l), href: null, url: `${BASE_URL}/${locale}${base}` },
      ]}
      related={{ title: children.length ? t('subcategories') : catName(parent ?? cat, l), items: related }}
    />
  );
}
