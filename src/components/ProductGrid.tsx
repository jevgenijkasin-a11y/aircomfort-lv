// Grid of product cards (crawlable <a> links). Used by the catalog, landing
// pages, product page blocks, blog articles and the calculator. No 'use client':
// rendered from a server page it stays server-only HTML (no product data is
// shipped to the browser); inside a client component it renders there.
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import type { CardProduct } from '@/lib/productCard';
import { starred } from '@/components/FootnoteStar';

export function ProductGrid({ products, locale, installFrom = 250 }: { products: CardProduct[]; locale: string; installFrom?: number }) {
  const tp = useTranslations('products');
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
      </div>
      <p className="mt-4 text-xs text-muted">{starred(tp('installNote'))}</p>
    </>
  );
}
