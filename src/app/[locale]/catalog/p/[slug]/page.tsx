// Product page: /[lang]/catalog/p/<slug> (one slug for all languages).
// An old slug (changed in the admin) or a product id → permanent redirect.
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProduct, getProductBySlug } from '@/lib/db';
import { DUPLICATE_REDIRECTS } from '@/lib/catalogData';
import { PRODUCT_ID_RE, productPath } from '@/lib/productSlug';
import type { SupabaseProduct } from '@/lib/types';
import ProductPage, { productMetadata } from '../../productPage';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** The product to show, or where to send the visitor instead. */
async function resolve(slug: string): Promise<{ product: SupabaseProduct } | { redirect: SupabaseProduct } | null> {
  if (PRODUCT_ID_RE.test(slug)) {
    const p = await getProduct(DUPLICATE_REDIRECTS[slug] ?? slug);
    return p ? { redirect: p } : null;
  }
  const found = await getProductBySlug(slug);
  if (!found) return null;
  // Hidden duplicates point to their original product
  const original = DUPLICATE_REDIRECTS[found.product.id];
  if (original) {
    const p = await getProduct(original);
    return p ? { redirect: p } : null;
  }
  return found.moved ? { redirect: found.product } : { product: found.product };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await resolve(slug);
  if (!r || !('product' in r)) return { title: 'AirComfort', robots: { index: false } };
  return productMetadata(locale, r.product);
}

export default async function ProductSlugPage({ params }: Props) {
  const { locale, slug } = await params;
  const r = await resolve(slug);
  if (!r) notFound();
  if ('redirect' in r) permanentRedirect(`/${locale}${productPath(r.redirect)}`);
  return <ProductPage locale={locale} product={r.product} />;
}
