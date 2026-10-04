'use client';

// Interactive bits of a product card (the card itself stays server-rendered):
// favourite / compare toggles on the photo. Styles are
// the short .pc-* classes (globals.css) and the icons come from IconSprite,
// so 24 cards per page add little HTML.
import { useTranslations } from 'next-intl';
import type { CardProduct } from '@/lib/productCard';
import { toggleFavorite, toggleCompare, useFavorites, useCompare } from '@/lib/shortlist';

export function CardToggles({ id, category, name, image, className = 'pc-tg' }: Pick<CardProduct, 'id' | 'category' | 'name' | 'image'> & { className?: string }) {
  const t = useTranslations('shop');
  const fav = useFavorites().includes(id);
  const inCmp = useCompare().some((x) => x.id === id);
  const favLabel = fav ? t('favRemove') : t('favAdd');
  const cmpLabel = inCmp ? t('cmpRemove') : t('cmpAdd');
  return (
    <div className={className}>
      <button type="button" className="pc-ib" aria-pressed={fav} aria-label={favLabel} title={favLabel} onClick={() => toggleFavorite(id)}>
        <span className="pc-ic"><svg aria-hidden><use href="#i-heart" /></svg></span>
      </button>
      <button type="button" className="pc-ib" aria-pressed={inCmp} aria-label={cmpLabel} title={cmpLabel} onClick={() => toggleCompare({ id, category, name, image })}>
        <span className="pc-ic"><svg aria-hidden><use href="#i-cmp" /></svg></span>
      </button>
    </div>
  );
}
