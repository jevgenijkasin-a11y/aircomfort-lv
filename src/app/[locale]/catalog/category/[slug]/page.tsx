export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listProducts, getSettings, listCategories } from '@/lib/db';
import { visibleProducts } from '@/lib/catalogData';
import { localizedAlternates, BASE_URL } from '@/lib/seo';
import { asLoc } from '@/lib/productSeo';
import { type Category, type Loc, catName, descendantKeys, hiddenKeys } from '@/lib/categories';
import LandingView from '@/components/LandingView';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Category landing pages managed in Admin → Categories (e.g. fan coils). */
async function load(slug: string) {
  const cats = listCategories();
  const hidden = hiddenKeys(cats);
  const cat = cats.find((c) => c.slug === slug) ?? null;
  const [all, settings] = await Promise.all([listProducts({ inStockOnly: true, orderBy: 'price' }), getSettings()]);
  const keys = cat ? descendantKeys(cats, cat.key) : new Set<string>();
  const products = visibleProducts(all, hidden).filter((p) => keys.has(p.category));
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  const visible = cats.filter((c) => !hidden.has(c.key));
  return { cat: cat && !hidden.has(cat.key) ? cat : null, products, installFrom, visible };
}

const h1Of = (c: Category, l: Loc) => c[`seo_h1_${l}`] || catName(c, l);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = asLoc(locale);
  const { cat, products } = await load(slug);
  if (!cat) return { title: 'AirComfort' };
  return {
    title: cat[`seo_title_${l}`] || h1Of(cat, l),
    description: cat[`seo_description_${l}`] || undefined,
    alternates: localizedAlternates(locale, `/catalog/category/${slug}`),
    // Empty sections are reachable but kept out of the index until they have products
    ...(products.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function ManagedCategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [{ cat, products, installFrom, visible }, tn, t] = await Promise.all([
    load(slug), getTranslations('nav'), getTranslations('catalog'),
  ]);
  if (!cat) notFound();
  // The original four categories live under /catalog/type/*
  if (cat.is_system) permanentRedirect(`/${locale}/catalog/type/${cat.slug}`);

  const parent = cat.parent_key ? visible.find((c) => c.key === cat.parent_key) ?? null : null;
  const children = visible.filter((c) => c.parent_key === cat.key);
  const siblings = parent ? visible.filter((c) => c.parent_key === parent.key && c.key !== cat.key) : [];
  const link = (c: Category) => ({ href: `/catalog/category/${c.slug}`, label: catName(c, l) });
  const related = [...children, ...(parent ? [parent] : []), ...siblings].map(link);
  const intro = (cat[`seo_intro_${l}`] || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <LandingView
      locale={locale}
      h1={h1Of(cat, l)}
      intro={intro}
      products={products}
      installFrom={installFrom}
      emptyText={t('categoryEmpty')}
      crumbs={[
        { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
        { name: tn('catalog'), href: '/catalog', url: `${BASE_URL}/${locale}/catalog` },
        ...(parent ? [{ name: catName(parent, l), href: `/catalog/category/${parent.slug}`, url: `${BASE_URL}/${locale}/catalog/category/${parent.slug}` }] : []),
        { name: catName(cat, l), href: null, url: `${BASE_URL}/${locale}/catalog/category/${cat.slug}` },
      ]}
      related={{ title: children.length ? t('subcategories') : catName(parent ?? cat, l), items: related }}
    />
  );
}
