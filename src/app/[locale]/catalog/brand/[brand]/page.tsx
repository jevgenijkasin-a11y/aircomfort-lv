export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listProducts, getSettings } from '@/lib/db';
import { visibleProducts } from '@/lib/catalogData';
import { localizedAlternates, BASE_URL } from '@/lib/seo';
import { asLoc, brandSlug, CATEGORY_SLUGS, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { stats, brandH1, brandIntro, brandMeta } from '@/lib/landing';
import LandingView from '@/components/LandingView';

type Props = { params: Promise<{ locale: string; brand: string }> };

async function load(slug: string) {
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const products = visibleProducts(all).filter((p) => brandSlug(p.brand) === slug);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  return { products, brand: products[0]?.brand ?? null, installFrom, all: visibleProducts(all) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand: slug } = await params;
  const { products, brand, installFrom } = await load(slug);
  if (!brand) return { title: 'AirComfort' };
  const m = brandMeta(brand, stats(products), asLoc(locale), installFrom);
  return { title: m.title, description: m.description, alternates: localizedAlternates(locale, `/catalog/brand/${slug}`) };
}

export default async function BrandPage({ params }: Props) {
  const { locale, brand: slug } = await params;
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [{ products, brand, installFrom, all }, tn, tc] = await Promise.all([
    load(slug), getTranslations('nav'), getTranslations('categories'),
  ]);
  if (!brand) notFound();

  const cats = Object.keys(CATEGORY_SLUGS).filter((c) => products.some((p) => p.category === c));
  const otherBrands = Array.from(new Set(all.map((p) => p.brand))).filter((b) => b !== brand).sort();
  const RELATED = { lv: 'Citi zīmoli un kategorijas', ru: 'Другие бренды и категории', en: 'Other brands and categories' };

  return (
    <LandingView
      locale={locale}
      h1={brandH1(brand, l)}
      intro={brandIntro(brand, stats(products), cats.map((c) => tc(CATEGORY_MSG_KEY[c])), l, installFrom)}
      products={products}
      installFrom={installFrom}
      crumbs={[
        { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
        { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
        { name: brand, href: null, url: `${BASE_URL}/${locale}/catalog/brand/${slug}` },
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
