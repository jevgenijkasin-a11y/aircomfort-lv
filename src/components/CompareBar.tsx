'use client';

// Sticky comparison bar (while ≥ 1 product is picked) + the notices for
// "other category" and "list full". Publishes its height as --compare-bar-h
// on <html>, so the floating buttons and the page bottom padding move up.
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useCompare, clearCompare, useCompareNotice, closeCompareNotice, replaceCompare } from '@/lib/shortlist';
import Sheet from '@/components/Sheet';

export default function CompareBar() {
  const t = useTranslations('shop');
  const items = useCompare();
  const notice = useCompareNotice();
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const show = items.length > 0 && pathname !== '/compare';

  useEffect(() => {
    const root = document.documentElement;
    if (!show || !bar.current) { root.style.removeProperty('--compare-bar-h'); return; }
    const el = bar.current;
    const apply = () => root.style.setProperty('--compare-bar-h', `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty('--compare-bar-h'); };
  }, [show]);

  return (
    <>
      {show && (
        <div ref={bar} role="region" aria-label={t('cmpTitle')}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
            <ul className="flex -space-x-2 flex-shrink-0" aria-label={t('cmpProducts')}>
              {items.map((it) => (
                <li key={it.id} data-theme="light" className="relative w-10 h-10 rounded-lg border-2 border-card bg-photo overflow-hidden" title={it.name}>
                  {it.image && <Image src={it.image} alt={it.name} fill sizes="40px" className="object-contain p-0.5 mix-blend-multiply" />}
                </li>
              ))}
            </ul>
            <Link href="/compare" className="ml-auto inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm transition-colors whitespace-nowrap">
              {t('cmpButton', { n: items.length })}
            </Link>
            <button type="button" onClick={clearCompare} className="min-h-[44px] px-3 rounded-xl text-sm font-semibold text-muted hover:text-fg border border-line hover:border-line-strong transition-colors">
              {t('clear')}
            </button>
          </div>
        </div>
      )}

      <Sheet open={!!notice} onClose={closeCompareNotice} closeLabel={t('close')}
        title={notice?.kind === 'category' ? t('cmpCategory') : t('cmpLimit', { n: notice?.kind === 'limit' ? notice.limit : 4 })}>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {notice?.kind === 'category' && (
            <button type="button" onClick={() => replaceCompare(notice.item)} className="flex-1 min-h-[48px] rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors">
              {t('replace')}
            </button>
          )}
          {notice?.kind === 'limit' && (
            <Link href="/compare" onClick={closeCompareNotice} className="flex-1 inline-flex items-center justify-center min-h-[48px] rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors">
              {t('cmpButton', { n: items.length })}
            </Link>
          )}
          <button type="button" onClick={closeCompareNotice} className="flex-1 min-h-[48px] rounded-xl border border-line text-fg font-semibold hover:border-line-strong transition-colors">
            {t('cancel')}
          </button>
        </div>
      </Sheet>
    </>
  );
}
