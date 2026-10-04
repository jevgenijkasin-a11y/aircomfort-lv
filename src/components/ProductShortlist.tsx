'use client';

// "Add to favourites" / "Compare" text buttons on the product page (same
// lists as the ♡ / ⇄ on catalog cards).
import { useTranslations } from 'next-intl';
import type { CompareItem } from '@/lib/shortlist';
import { toggleFavorite, toggleCompare, useFavorites, useCompare } from '@/lib/shortlist';

const btn = (on: boolean) =>
  `inline-flex items-center gap-2 min-h-[44px] px-3 -mx-1 rounded-xl text-sm font-semibold transition-colors ${
    on ? 'text-primary' : 'text-muted hover:text-primary'
  }`;

export default function ProductShortlist({ item }: { item: CompareItem }) {
  const t = useTranslations('shop');
  const fav = useFavorites().includes(item.id);
  const inCmp = useCompare().some((x) => x.id === item.id);
  return (
    <div className="flex flex-wrap items-center gap-x-4">
      <button type="button" aria-pressed={fav} title={fav ? t('favRemove') : t('favAdd')} onClick={() => toggleFavorite(item.id)} className={btn(fav)}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
          <use href="#i-heart" style={{ fill: fav ? 'currentColor' : 'none' }} />
        </svg>
        {fav ? t('favIn') : t('favAdd')}
      </button>
      <button type="button" aria-pressed={inCmp} title={inCmp ? t('cmpRemove') : t('cmpAdd')} onClick={() => toggleCompare(item)} className={btn(inCmp)}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><use href="#i-cmp" /></svg>
        {inCmp ? t('cmpIn') : t('cmpAdd')}
      </button>
    </div>
  );
}
