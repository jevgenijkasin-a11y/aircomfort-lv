import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Reviews from '@/components/Reviews';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

const brandList = ['Daikin', 'Mitsubishi', 'LG', 'TCL', 'Midea', 'Nordis', 'Hisense', 'Toshiba'];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tn, th] = await Promise.all([
    getTranslations('cta'),
    getTranslations('nav'),
    getTranslations('hero'),
  ]);

  return (
    <>
      <Hero />
      <section className="py-14 border-y border-[#1A6B9A]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {brandList.map((b) => (
              <span
                key={b}
                className="font-syne font-bold text-xl text-white/20 hover:text-white/50 transition-colors cursor-default tracking-wide"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
      <Services />
      <Categories />
      <FeaturedProducts />
      <Reviews />
      <section className="section-padding bg-[#051e31] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#27C4A0]/5 blur-[100px]" />
        <div className="reveal relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#27C4A0]/10 border border-[#27C4A0]/25 text-[#27C4A0] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27C4A0]" />
            {th('badge')}
          </div>
          <h2 className="font-syne font-bold text-3xl sm:text-5xl mb-4 max-w-2xl mx-auto leading-tight">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
          <p className="text-white/45 text-lg mb-8 max-w-lg mx-auto">{t('subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacts"
              className="magnetic inline-flex items-center justify-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-[#27C4A0]/25"
            >
              {tn('getQuote')}
            </Link>
            <Link
              href="/calculator"
              className="magnetic inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm"
            >
              {th('ctaCalculator')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
