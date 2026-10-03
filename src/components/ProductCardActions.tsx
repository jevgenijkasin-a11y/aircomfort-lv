'use client';

// Interactive bits of a product card (the card itself stays server-rendered):
// favourite / compare toggles on the photo and the "Order" button. Styles are
// the short .pc-* classes (globals.css) and the icons come from IconSprite,
// so 24 cards per page add little HTML.
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { type CardProduct, finalCardPrice } from '@/lib/productCard';
import { toggleFavorite, toggleCompare, useFavorites, useCompare } from '@/lib/shortlist';

// The form is only loaded when someone opens it
const RequestDialog = dynamic(() => import('@/components/RequestDialog'), { ssr: false });

export function CardToggles({ id, category, name, image }: Pick<CardProduct, 'id' | 'category' | 'name' | 'image'>) {
  const t = useTranslations('shop');
  const fav = useFavorites().includes(id);
  const inCmp = useCompare().some((x) => x.id === id);
  const favLabel = fav ? t('favRemove') : t('favAdd');
  const cmpLabel = inCmp ? t('cmpRemove') : t('cmpAdd');
  return (
    <div className="pc-tg">
      <button type="button" className="pc-ib" aria-pressed={fav} aria-label={favLabel} title={favLabel} onClick={() => toggleFavorite(id)}>
        <span className="pc-ic"><svg aria-hidden><use href="#i-heart" /></svg></span>
      </button>
      <button type="button" className="pc-ib" aria-pressed={inCmp} aria-label={cmpLabel} title={cmpLabel} onClick={() => toggleCompare({ id, category, name, image })}>
        <span className="pc-ic"><svg aria-hidden><use href="#i-cmp" /></svg></span>
      </button>
    </div>
  );
}

export function OrderButton({ product, className = '' }: { product: Pick<CardProduct, 'id' | 'name' | 'price' | 'discount_percent' | 'image'>; className?: string }) {
  const t = useTranslations('shop');
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`pc-order ${className}`}>{t('order')}</button>
      {open && (
        <RequestDialog mode="order" onClose={() => setOpen(false)}
          products={[{ id: product.id, name: product.name, price: finalCardPrice(product), image: product.image }]} />
      )}
    </>
  );
}
