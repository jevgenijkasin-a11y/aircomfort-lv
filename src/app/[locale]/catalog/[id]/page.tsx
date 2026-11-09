// /catalog/<segment>: a category page (/catalog/home-air-conditioners), or an
// old product address /catalog/<uuid> → permanent redirect to /catalog/p/<slug>.
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProduct } from '@/lib/db';
import { DUPLICATE_REDIRECTS } from '@/lib/catalogData';
import { PRODUCT_ID_RE, productPath } from '@/lib/productSlug';
import CategoryListing, { categoryListingMetadata } from '@/components/CategoryListing';

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  if (!PRODUCT_ID_RE.test(id)) return categoryListingMetadata(locale, [id], await searchParams);
  return { title: 'AirComfort', robots: { index: false } };
}

export default async function CatalogSegmentPage({ params, searchParams }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  if (!PRODUCT_ID_RE.test(id)) return <CategoryListing locale={locale} segments={[id]} sp={await searchParams} />;
  // Old product address: find the product by id and send it to its readable address
  const product = await getProduct(DUPLICATE_REDIRECTS[id] ?? id);
  if (!product) notFound();
  permanentRedirect(`/${locale}${productPath(product)}`);
}
