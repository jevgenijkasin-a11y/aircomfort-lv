'use client';

// ♡ in the header with the number of favourites (0 is not shown).
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useFavorites } from '@/lib/shortlist';

export default function FavoritesLink() {
  const t = useTranslations('shop');
  const n = useFavorites().length;
  const label = n ? `${t('favNav')} (${n})` : t('favNav');
  return (
    <Link href="/favorites" aria-label={label} title={label}
      className="relative w-11 h-11 inline-flex items-center justify-center rounded-xl text-muted hover:text-fg hover:bg-fg/5 transition-colors">
      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.2 4.5c2 0 3.4 1.1 4.8 2.9 1.4-1.8 2.8-2.9 4.8-2.9 3.6 0 5.7 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      {n > 0 && (
        <span aria-hidden="true" className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[11px] font-bold leading-[18px] text-center">
          {n > 99 ? '99+' : n}
        </span>
      )}
    </Link>
  );
}
