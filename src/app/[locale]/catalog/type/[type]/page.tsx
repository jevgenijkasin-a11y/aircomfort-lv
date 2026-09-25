export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listProducts, getSettings, hiddenCategoryKeys } from '@/lib/db';
import { visibleProducts } from '@/lib/catalogData';
import { localizedAlternates, BASE_URL } from '@/lib/seo';
import { asLoc, brandSlug, categoryFromSlug, CATEGORY_SLUGS, CATEGORY_MSG_KEY } from '@/lib/productSeo';
import { stats, categoryIntro, categoryMeta } from '@/lib/landing';
import LandingView from '@/components/LandingView';

type Props = { params: Promise<{ locale: string; type: string }> };

async function load(slug: string) {
  const cat = categoryFromSlug(slug);
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const visible = visibleProducts(all, hiddenCategoryKeys());
  const products = cat ? visible.filter((p) => p.category === cat) : [];
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  return { cat, products, installFrom, all: visible };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const { cat, products, installFrom } = await load(type);
  if (!cat || !products.length) return { title: 'AirComfort' };
  const tc = await getTranslations({ locale, namespace: 'categories' });
  const m = categoryMeta(tc(CATEGORY_MSG_KEY[cat]), stats(products), asLoc(locale), installFrom);
  return { title: m.title, description: m.description, alternates: localizedAlternates(locale, `/catalog/type/${type}`) };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, type } = await params;
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [{ cat, products, installFrom, all }, tn, tc] = await Promise.all([
    load(type), getTranslations('nav'), getTranslations('categories'),
  ]);
  if (!cat || !products.length) notFound();

  const label = tc(CATEGORY_MSG_KEY[cat]);
  const brands = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.brand]: (acc[p.brand] ?? 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const otherCats = Object.keys(CATEGORY_SLUGS).filter((c) => c !== cat && all.some((p) => p.category === c));
  const RELATED = { lv: 'Zīmoli un citas kategorijas', ru: 'Бренды и другие категории', en: 'Brands and other categories' };

  return (
    <LandingView
      locale={locale}
      h1={label}
      intro={categoryIntro(label, tc(`${CATEGORY_MSG_KEY[cat]}Desc`), stats(products), brands, l, installFrom)}
      products={products}
      installFrom={installFrom}
      crumbs={[
        { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
        { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
        { name: label, href: null, url: `${BASE_URL}/${locale}/catalog/type/${type}` },
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
