'use client';

// Shown instead of the default Next.js error screen when a page throws
// (rendered inside the locale layout, so the header and footer stay).
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage');
  useEffect(() => { console.error('[page error]', error.digest ?? '', error.message); }, [error]);
  return (
    <div className="pt-40 pb-24 max-w-2xl mx-auto px-4 text-center">
      <p className="font-heading font-bold text-6xl text-primary mb-4">500</p>
      <h1 className="font-heading font-bold text-3xl mb-3">{t('title')}</h1>
      <p className="text-muted mb-8">{t('text')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="inline-block bg-primary hover:bg-primary-hover text-on-primary font-bold px-6 py-3 rounded-xl transition-colors">
          {t('retry')}
        </button>
        <Link href="/" className="inline-block border border-line hover:border-primary text-fg font-bold px-6 py-3 rounded-xl transition-colors">
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
