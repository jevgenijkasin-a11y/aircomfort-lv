'use client';

// Grid / list switch for product grids on phones. The choice lives in
// localStorage and on <html data-catalog-view>, which an inline script in the
// layout sets before the first paint — so cards never jump after loading.
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// Same key as VIEW_SCRIPT in lib/theme.ts
const KEY = 'catalogView';

export default function ViewToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('shop');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  useEffect(() => {
    setView(document.documentElement.getAttribute('data-catalog-view') === 'list' ? 'list' : 'grid');
  }, []);
  const choose = (v: 'grid' | 'list') => {
    setView(v);
    if (v === 'list') document.documentElement.setAttribute('data-catalog-view', 'list');
    else document.documentElement.removeAttribute('data-catalog-view');
    try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ }
  };
  const btn = (on: boolean) =>
    `w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${on ? 'bg-primary text-on-primary' : 'text-muted hover:text-fg'}`;
  return (
    <div role="group" aria-label={t('viewLabel')} className={`flex flex-shrink-0 rounded-xl bg-surface border border-line p-0.5 ${className}`}>
      <button type="button" aria-pressed={view === 'grid'} aria-label={t('viewGrid')} title={t('viewGrid')} onClick={() => choose('grid')} className={btn(view === 'grid')}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>
      </button>
      <button type="button" aria-pressed={view === 'list'} aria-label={t('viewList')} title={t('viewList')} onClick={() => choose('list')} className={btn(view === 'list')}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><rect x="4" y="4.5" width="5" height="5" rx="1" /><rect x="4" y="14.5" width="5" height="5" rx="1" /><path strokeLinecap="round" d="M12 6h8M12 9h5M12 16h8M12 19h5" /></svg>
      </button>
    </div>
  );
}
