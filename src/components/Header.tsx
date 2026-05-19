'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

const locales = ['lv', 'ru', 'en'] as const;

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
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
    { href: '/contacts' as const, label: t('contacts') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-[#072D47]/98 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-[#1A6B9A]/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#27C4A0] to-[#1A6B9A] flex items-center justify-center shadow-lg shadow-[#27C4A0]/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
              Air<span className="text-[#27C4A0]">Comfort</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base font-medium text-white/65 hover:text-white transition-colors duration-200 relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#27C4A0] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right: lang + CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#0D3D5E]/70 rounded-xl p-1 gap-0.5">
              {locales.map((lang) => (
                <a
                  key={lang}
                  href={`/${lang}`}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    locale === lang
                      ? 'bg-[#27C4A0] text-[#072D47]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </a>
              ))}
            </div>

            <Link
              href="/contacts"
              className="hidden sm:flex items-center gap-1.5 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-semibold text-base px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#27C4A0]/20 hover:shadow-[#27C4A0]/30"
            >
              {t('getQuote')}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Menu"
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
          <div className="border-t border-[#1A6B9A]/20 pt-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-[#1A6B9A]/20 flex items-center justify-between px-1">
              <div className="flex items-center bg-[#0D3D5E]/70 rounded-xl p-1 gap-0.5">
                {locales.map((lang) => (
                  <a
                    key={lang}
                    href={`/${lang}`}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      locale === lang
                        ? 'bg-[#27C4A0] text-[#072D47]'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </a>
                ))}
              </div>
              <Link
                href="/contacts"
                onClick={() => setMenuOpen(false)}
                className="bg-[#27C4A0] text-[#072D47] font-semibold text-sm px-4 py-2 rounded-xl"
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
