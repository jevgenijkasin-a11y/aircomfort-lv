import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSettings, getHeroSlides } from '@/lib/supabase';
import HeroSlider from './HeroSlider';
import CoolWidget from './CoolWidget';
import AirFlow from './AirFlow';

const DEFAULT_SLIDES = [
  'https://images.unsplash.com/photo-1631545806609-bbb02e574b74?w=1920&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1920&q=80',
];

export default async function Hero() {
  const [t, locale, settings, dbSlides] = await Promise.all([
    getTranslations('hero'),
    getLocale(),
    getSettings(),
    getHeroSlides(),
  ]);

  const slideUrls = dbSlides.length > 0 ? dbSlides : DEFAULT_SLIDES;

  const titleFromSettings = settings[`hero_title_${locale}`];
  const titleMain = titleFromSettings || t('title');
  const showAccent = !titleFromSettings; // only show accent span when no settings title
  const subtitle = settings[`hero_subtitle_${locale}`] || t('subtitle');

  const heroServices = [
    {
      label: t('serviceHome'),
      href: '/catalog?category=home',
      color: '#27C4A0',
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      label: t('serviceHeatPump'),
      href: '/catalog?category=heat_pump',
      color: '#3B82F6',
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      label: t('serviceCommercial'),
      href: '/catalog?category=commercial',
      color: '#F59E0B',
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    {
      label: t('serviceMaintenance'),
      href: '/contacts',
      color: '#8B5CF6',
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  const stats = [
    {
      value: settings.stat1_value || t('stat1Value'),
      label: settings[`stat1_label_${locale}`] || t('stat1Label'),
    },
    {
      value: settings.stat2_value || t('stat2Value'),
      label: settings[`stat2_label_${locale}`] || t('stat2Label'),
    },
    {
      value: settings.stat3_value || t('stat3Value'),
      label: settings[`stat3_label_${locale}`] || t('stat3Label'),
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <HeroSlider slides={slideUrls} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#040f18]/90 via-[#072D47]/80 to-[#0b3d5c]/85" />
      <AirFlow />
      {/* Diagonal lines decorative accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none z-10">
        <svg viewBox="0 0 500 800" className="w-full h-full" preserveAspectRatio="none">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={i * 50} y1="0" x2={i * 50 + 300} y2="800" stroke="#27C4A0" strokeWidth="1" />
          ))}
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="max-w-3xl mx-auto sm:mx-0 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#27C4A0]/10 border border-[#27C4A0]/25 text-[#27C4A0] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27C4A0] animate-pulse" />
            {t('badge')}
          </div>

          <h1 className="font-syne font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-7 tracking-tight">
            {titleMain}{' '}
            {showAccent && <span className="gradient-text">{t('titleAccent')}</span>}
          </h1>

          <p className="text-lg sm:text-xl text-white/55 mb-10 leading-relaxed max-w-xl mx-auto sm:mx-0">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-start">
            <Link
              href="/catalog"
              className="magnetic inline-flex items-center justify-center gap-3 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-extrabold text-xl px-12 py-6 rounded-2xl transition-all duration-200 shadow-[0_8px_40px_rgba(39,196,160,0.5)] hover:shadow-[0_12px_50px_rgba(39,196,160,0.65)] tracking-wide"
            >
              {t('ctaCatalog')}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
            <Link
              href="/calculator"
              className="magnetic inline-flex items-center justify-center gap-3 bg-white/12 hover:bg-white/20 border-2 border-white/40 hover:border-white/70 text-white font-extrabold text-xl px-12 py-6 rounded-2xl transition-all duration-200 backdrop-blur-sm tracking-wide"
            >
              {t('ctaCalculator')}
            </Link>
          </div>

          <div className="mt-16 sm:flex sm:flex-wrap sm:items-end sm:justify-start sm:gap-x-10 sm:gap-y-6">
            <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:contents">
              {stats.map((stat) => {
                const match = stat.value.match(/^([\d.]+)(.*)$/);
                const numPart = match ? match[1] : null;
                const suffix = match ? match[2] : '';
                return (
                  <div key={stat.label} className="flex flex-col items-center sm:items-start">
                    {numPart ? (
                      <span
                        className="font-syne font-bold text-3xl text-[#27C4A0]"
                        data-count={numPart}
                        data-suffix={suffix}
                        suppressHydrationWarning
                      >
                        0{suffix}
                      </span>
                    ) : (
                      <span className="font-syne font-bold text-3xl text-[#27C4A0]">{stat.value}</span>
                    )}
                    <span className="text-sm text-white/45 mt-0.5 text-center sm:text-left">{stat.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 sm:mt-0 flex justify-center sm:justify-start">
              <CoolWidget label={t('coolWidget')} />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
            {heroServices.map(({ icon, label, color, href }) => (
              <Link key={label} href={href} className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3 hover:border-white/15 hover:bg-white/7 transition-colors h-full min-h-[52px]">
                <span style={{ color }} className="flex-shrink-0">{icon}</span>
                <span className="text-white/70 text-xs font-medium leading-snug">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 hidden xl:block opacity-20 pointer-events-none">
          <div className="w-72 h-48 rounded-3xl border border-[#27C4A0]/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A6B9A]/20 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#27C4A0]/30 rounded-t-3xl" />
            <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-[#27C4A0]/20 rounded-full" />
            <div className="absolute bottom-8 left-4 right-4 h-1 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-[#27C4A0]" fill="none" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#072D47] to-transparent z-10" />
    </section>
  );
}
