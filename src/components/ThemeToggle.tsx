'use client';

import { useTranslations } from 'next-intl';

type Win = Window & { __setTheme?: (t: 'light' | 'dark') => void };

/**
 * Moon/sun button. The icon is chosen by CSS (`dark:` variants), so server and
 * client render the same markup; the choice itself is applied and saved by
 * window.__setTheme from the inline theme script (see lib/theme.ts).
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('nav');
  const toggle = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const w = window as Win;
    if (w.__setTheme) w.__setTheme(next);
    else document.documentElement.setAttribute('data-theme', next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('themeToggle')}
      title={t('themeToggle')}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border border-line text-fg hover:text-primary hover:border-line-strong transition-colors ${className}`}
    >
      {/* moon: shown in the light theme (switch to dark) */}
      <svg className="w-5 h-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
      {/* sun: shown in the dark theme (switch to light) */}
      <svg className="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4l1.4-1.4" />
      </svg>
    </button>
  );
}
