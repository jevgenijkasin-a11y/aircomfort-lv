export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listProducts, getSettings, hiddenCategoryKeys } from '@/lib/db';
import { visibleProducts, pricedFirst } from '@/lib/catalogData';
import { BASE_URL } from '@/lib/seo';
import { asLoc, brandSlug, CATEGORY_SLUGS, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { stats, brandH1, brandIntro, brandMeta } from '@/lib/landing';
import { listingMetadata, pageFromSearch, pagePath, pageSuffix, paginate } from '@/lib/pagination';
import LandingView from '@/components/LandingView';

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string; brand: string }>; searchParams: Promise<SP> };

async function load(slug: string) {
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const products = pricedFirst(visibleProducts(all, hiddenCategoryKeys()).filter((p) => brandSlug(p.brand) === slug));
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  return { products, brand: products[0]?.brand ?? null, installFrom, all: visibleProducts(all, hiddenCategoryKeys()) };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale, brand: slug }, sp] = await Promise.all([params, searchParams]);
  const { products, brand, installFrom } = await load(slug);
  if (!brand) return { title: 'AirComfort' };
  const l = asLoc(locale);
  const page = pageFromSearch(sp);
  const m = brandMeta(brand, stats(products), l, installFrom);
  return listingMetadata({
    locale,
    path: pagePath(`/catalog/brand/${slug}`, page),
    title: m.title + pageSuffix(page, l),
    description: page > 1 ? `${m.description}${pageSuffix(page, l).replace(' — ', ' (')})` : m.description,
  });
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [{ locale, brand: slug }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [{ products, brand, installFrom, all }, tn, tc] = await Promise.all([
    load(slug), getTranslations('nav'), getTranslations('categories'),
  ]);
  if (!brand) notFound();
  const page = pageFromSearch(sp);
  const { items, totalPages, offset } = paginate(products, page);
  if (page > totalPages) notFound();

  const cats = Object.keys(CATEGORY_SLUGS).filter((c) => products.some((p) => p.category === c));
  const otherBrands = Array.from(new Set(all.map((p) => p.brand))).filter((b) => b !== brand).sort();
  const RELATED = { lv: 'Citi zīmoli un kategorijas', ru: 'Другие бренды и категории', en: 'Other brands and categories' };
  const base = `/catalog/brand/${slug}`;

  return (
    <LandingView
      locale={locale}
      h1={brandH1(brand, l) + pageSuffix(page, l)}
      intro={brandIntro(brand, stats(products), cats.map((c) => tc(CATEGORY_MSG_KEY[c])), l, installFrom)}
      products={items}
      page={page}
      totalPages={totalPages}
      offset={offset}
      basePath={base}
      installFrom={installFrom}
      crumbs={[
        { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
        { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
        { name: brand, href: null, url: `${BASE_URL}/${locale}${base}` },
      ]}
      related={{
        title: RELATED[l],
        items: [
          ...cats.map((c) => ({ href: `/catalog/type/${CATEGORY_SLUGS[c]}`, label: tc(CATEGORY_MSG_KEY[c]) })),
          ...otherBrands.map((b) => ({ href: `/catalog/brand/${brandSlug(b)}`, label: b })),
        ],
      }}
    />
  );
}
