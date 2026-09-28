import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Reviews from '@/components/Reviews';
import BrandMarquee from '@/components/BrandMarquee';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';


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
      <BrandMarquee />
      <Services />
      <Categories />
      <FeaturedProducts />
      <Reviews />
      {/* Brand navy CTA banner in both themes (tokens inside resolve to dark) */}
      <section data-theme="dark" className="section-padding bg-ink text-fg relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="reveal relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {th('badge')}
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-5xl mb-4 max-w-2xl mx-auto leading-tight">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
          <p className="text-muted text-lg mb-8 max-w-lg mx-auto">{t('subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacts"
              className="magnetic inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-on-primary font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-glow/25"
            >
              {tn('getQuote')}
            </Link>
            <Link
              href="/calculator"
              className="magnetic inline-flex items-center justify-center gap-2 bg-fg/5 hover:bg-fg/10 border border-line text-fg font-semibold text-base px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm"
            >
              {th('ctaCalculator')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
