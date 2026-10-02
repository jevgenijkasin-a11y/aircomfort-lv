export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listProducts, getSettings, hiddenCategoryKeys } from '@/lib/db';
import { visibleProducts, pricedFirst } from '@/lib/catalogData';
import { BASE_URL } from '@/lib/seo';
import { asLoc, brandSlug, categoryFromSlug, CATEGORY_SLUGS, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { stats, categoryIntro, categoryMeta } from '@/lib/landing';
import { listingMetadata, pageFromSearch, pagePath, pageSuffix, paginate } from '@/lib/pagination';
import LandingView from '@/components/LandingView';

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string; type: string }>; searchParams: Promise<SP> };

async function load(slug: string) {
  const cat = categoryFromSlug(slug);
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const visible = visibleProducts(all, hiddenCategoryKeys());
  const products = cat ? pricedFirst(visible.filter((p) => p.category === cat)) : [];
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  return { cat, products, installFrom, all: visible };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale, type }, sp] = await Promise.all([params, searchParams]);
  const { cat, products, installFrom } = await load(type);
  if (!cat || !products.length) return { title: 'AirComfort' };
  const l = asLoc(locale);
  const page = pageFromSearch(sp);
  const tc = await getTranslations({ locale, namespace: 'categories' });
  const m = categoryMeta(tc(CATEGORY_MSG_KEY[cat]), stats(products), l, installFrom);
  return listingMetadata({
    locale,
    path: pagePath(`/catalog/type/${type}`, page),
    title: m.title + pageSuffix(page, l),
    description: page > 1 ? `${m.description}${pageSuffix(page, l).replace(' — ', ' (')})` : m.description,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ locale, type }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [{ cat, products, installFrom, all }, tn, tc] = await Promise.all([
    load(type), getTranslations('nav'), getTranslations('categories'),
  ]);
  if (!cat || !products.length) notFound();
  const page = pageFromSearch(sp);
  const { items, totalPages, offset } = paginate(products, page);
  if (page > totalPages) notFound();

  const label = tc(CATEGORY_MSG_KEY[cat]);
  const brands = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.brand]: (acc[p.brand] ?? 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const otherCats = Object.keys(CATEGORY_SLUGS).filter((c) => c !== cat && all.some((p) => p.category === c));
  const RELATED = { lv: 'Zīmoli un citas kategorijas', ru: 'Бренды и другие категории', en: 'Brands and other categories' };
  const base = `/catalog/type/${type}`;

  return (
    <LandingView
      locale={locale}
      h1={label + pageSuffix(page, l)}
      intro={categoryIntro(label, tc(`${CATEGORY_MSG_KEY[cat]}Desc`), stats(products), brands, l, installFrom)}
      products={items}
      page={page}
      totalPages={totalPages}
      offset={offset}
      basePath={base}
      installFrom={installFrom}
      crumbs={[
        { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
        { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
        { name: label, href: null, url: `${BASE_URL}/${locale}${base}` },
      ]}
      related={{
        title: RELATED[l],
        items: [
          ...brands.map((b) => ({ href: `/catalog/brand/${brandSlug(b)}`, label: b })),
          ...otherCats.map((c) => ({ href: `/catalog/type/${CATEGORY_SLUGS[c]}`, label: tc(CATEGORY_MSG_KEY[c]) })),
        ],
      }}
    />
  );
}
