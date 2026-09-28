'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'cookie_consent';

export default function CookieBanner() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = (value: 'all' | 'necessary') => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-page backdrop-blur-md border-t border-line shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-muted text-sm leading-relaxed">
            {t('text')}{' '}
            <Link href="/privacy" className="text-primary hover:text-fg underline transition-colors">
              {t('learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => accept('necessary')}
            className="text-muted hover:text-fg text-sm font-medium px-4 py-2 rounded-xl border border-line hover:border-line-strong transition-all"
          >
            {t('necessary')}
          </button>
          <button
            onClick={() => accept('all')}
            className="bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-lg shadow-glow/20"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
