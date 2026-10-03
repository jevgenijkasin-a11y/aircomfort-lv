'use client';

// Grid of product cards (crawlable <a> links, rendered on the server too).
// Used by landing pages, product page blocks, blog articles and the
// calculator. A client component on purpose: the page then carries only the
// slim card data (CardProduct) instead of the whole card markup a second time
// in the React payload — this keeps category / brand pages small.
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import type { CardProduct } from '@/lib/productCard';
import { starred } from '@/components/FootnoteStar';

export function ProductGrid({ products, locale, installFrom = 250 }: { products: CardProduct[]; locale: string; installFrom?: number }) {
  const tp = useTranslations('products');
  return (
    <>
      <div className="product-grid grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} locale={locale} installFrom={installFrom} />)}
      </div>
      <p className="hidden md:block mt-4 text-xs text-muted">{starred(tp('installNote'))}</p>
    </>
  );
}
