'use client';

// Favourites page body: cards for the ids in localStorage (loaded from
// /api/products — out-of-stock / hidden products are not shown), "Remove"
// under each card and "Send the selection to us".
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ProductCard from '@/components/ProductCard';
import type { CardProduct } from '@/lib/productCard';
import { useFavorites, removeFavorite, keepFavorites } from '@/lib/shortlist';
import { finalCardPrice } from '@/lib/productCard';

const RequestDialog = dynamic(() => import('@/components/RequestDialog'), { ssr: false });

export default function FavoritesView({ locale, installFrom }: { locale: string; installFrom: number }) {
  const t = useTranslations('shop');
  const ids = useFavorites();
  const [cards, setCards] = useState<CardProduct[] | null>(null);
  const [sending, setSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const key = ids.join(',');
  useEffect(() => {
    if (!hydrated) return;
    if (!key) { setCards([]); return; }
    let alive = true;
    fetch(`/api/products?ids=${encodeURIComponent(key)}&locale=${locale}`)
      .then((r) => r.json())
      .then((d: { cards: CardProduct[] }) => {
        if (!alive) return;
        setCards(d.cards);
        keepFavorites(d.cards.map((c) => c.id));
      })
      .catch(() => alive && setCards([]));
    return () => { alive = false; };
  }, [key, locale, hydrated]);

  // Cards keep the order of the list; removed ones disappear at once
  const shown = (cards ?? []).filter((c) => ids.includes(c.id));

  if (cards === null) {
    return (
      <div className="product-grid grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: Math.min(Math.max(ids.length, 2), 8) }, (_, i) => (
          <div key={i} className="glass-card rounded-2xl p-2 md:p-3 h-[340px] md:h-[400px] animate-pulse"><div className="pc-photo h-48 rounded-xl bg-surface" /></div>
        ))}
      </div>
    );
  }

  if (!shown.length) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-muted mb-5">{t('favEmpty')}</p>
        <Link href="/catalog" className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors">{t('toCatalog')}</Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-muted text-sm max-w-2xl">{t('favIntro')}</p>
        <button type="button" onClick={() => setSending(true)}
          className="w-full sm:w-auto min-h-[48px] px-6 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors">
          {t('favSend')}
        </button>
      </div>
      <ul className="product-grid grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((c) => (
          <li key={c.id} className="flex flex-col gap-2">
            <ProductCard product={c} locale={locale} installFrom={installFrom} />
            <button type="button" onClick={() => removeFavorite(c.id)}
              className="min-h-[44px] rounded-xl border border-line text-sm font-semibold text-muted hover:text-heat hover:border-heat/40 transition-colors inline-flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {t('remove')}
            </button>
          </li>
        ))}
      </ul>
      {sending && (
        <RequestDialog mode="favorites" onClose={() => setSending(false)}
          products={shown.map((c) => ({ id: c.id, name: c.name, price: finalCardPrice(c), image: c.image }))} />
      )}
    </>
  );
}
