import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Reviews from '@/components/Reviews';
import BrandMarquee from '@/components/BrandMarquee';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getSettings } from '@/lib/db';
import { homeJsonLd } from '@/lib/company';
import { jsonLdString } from '@/lib/productSeo';
import { BASE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Brand + city in the home title so "aircomfort lv" searches resolve to this shop
const HOME_META = {
  lv: {
    title: 'AirComfort — kondicionieri un siltumsūkņi Rīgā ar montāžu',
    description: 'AirComfort — Daikin, Mitsubishi Electric, Midea kondicionieru un siltumsūkņu pārdošana un montāža Rīgā un visā Latvijā. Montāža no 1 dienas, garantija.',
  },
  ru: {
    title: 'AirComfort — кондиционеры и тепловые насосы в Риге с монтажом',
    description: 'AirComfort — продажа и монтаж кондиционеров и тепловых насосов Daikin, Mitsubishi Electric, Midea в Риге и по всей Латвии. Монтаж от 1 дня, гарантия.',
  },
  en: {
    title: 'AirComfort — air conditioners and heat pumps in Riga with installation',
    description: 'AirComfort sells and installs Daikin, Mitsubishi Electric and Midea air conditioners and heat pumps in Riga and across Latvia. Fitting from 1 day, warranty.',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = HOME_META[(locale === 'ru' || locale === 'en' ? locale : 'lv') as keyof typeof HOME_META];
  return {
    title: { absolute: m.title }, // no "| AirComfort" suffix — the brand already leads
    description: m.description,
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}`,
      title: m.title,
      description: m.description,
      siteName: 'AirComfort',
    },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tn, th, settings] = await Promise.all([
    getTranslations('cta'),
    getTranslations('nav'),
    getTranslations('hero'),
    getSettings(),
  ]);

  return (
    <>
      {/* Organization + WebSite structured data (brand shop in Riga) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(homeJsonLd(locale, settings)) }} />
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
