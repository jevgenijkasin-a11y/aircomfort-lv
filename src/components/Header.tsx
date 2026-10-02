'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { usePageLocales } from '@/lib/pageLocales';

const locales = ['lv', 'ru', 'en'] as const;

/** showBlog: the current language has published articles (menu item "Guides"). */
export default function Header({ showBlog = false }: { showBlog?: boolean }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  // A page missing in some language (blog article) → switch to the article list there
  const pageLocales = usePageLocales();
  const langHref = (lang: string) => (pageLocales && !pageLocales.includes(lang) ? '/blog' : pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/' as const, label: t('home') },
    { href: '/catalog' as const, label: t('catalog') },
    { href: '/calculator' as const, label: t('calculator') },
    ...(showBlog ? [{ href: '/blog' as const, label: t('blog') }] : []),
    { href: '/contacts' as const, label: t('contacts') },
  ];

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'top-0' : 'top-8 sm:top-9'
      } ${
        // Same in both themes: transparent over the hero until the page scrolls
        scrolled || menuOpen
          ? 'bg-page/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 border-b border-line'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-logo-blue flex items-center justify-center shadow-lg shadow-glow/20">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="font-heading font-bold text-lg sm:text-2xl xl:text-3xl tracking-tight">
              Air<span className="text-primary">Comfort</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base font-medium text-muted hover:text-fg transition-colors duration-200 relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right: lang + CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-surface rounded-xl p-1 gap-0.5">
              {locales.map((lang) => (
                <Link
                  key={lang}
                  href={langHref(lang)}
                  locale={lang}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    locale === lang
                      ? 'bg-primary text-on-primary'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  {lang.toUpperCase()}
                </Link>
              ))}
            </div>

            <Link
              href="/contacts"
              className="magnetic hidden sm:flex lg:hidden xl:flex whitespace-nowrap items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary font-semibold text-base px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-glow/20 hover:shadow-glow/30"
            >
              {t('getQuote')}
            </Link>

            <ThemeToggle />

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-11 h-11 -mr-1 inline-flex items-center justify-center text-muted hover:text-fg transition-colors"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? 'max-h-96 pb-5' : 'max-h-0'
          }`}
        >
          <div className="border-t border-line pt-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-muted hover:text-fg hover:bg-fg/5 rounded-lg transition-all"
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-line flex items-center justify-between px-1">
              <div className="flex items-center bg-surface rounded-xl p-1 gap-0.5">
                {locales.map((lang) => (
                  <Link
                    key={lang}
                    href={langHref(lang)}
                    locale={lang}
                    onClick={() => setMenuOpen(false)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      locale === lang
                        ? 'bg-primary text-on-primary'
                        : 'text-muted hover:text-fg'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </Link>
                ))}
              </div>
              <Link
                href="/contacts"
                onClick={() => setMenuOpen(false)}
                className="bg-primary text-on-primary font-semibold text-sm px-4 py-2 rounded-xl"
              >
                {t('getQuote')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
