import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import Footer from '@/components/Footer';
import FloatingButtons from '@/components/FloatingButtons';
import ScrollToTop from '@/components/ScrollToTop';
import CookieBanner from '@/components/CookieBanner';
import '../globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://aircomfort.lv';

const LOCALE_META: Record<string, { title: string; description: string; ogLocale: string }> = {
  lv: {
    title: 'AirComfort — Kondicionētāji Latvijā',
    description:
      'Profesionāla kondicionēšanas iekārtu piegāde un uzstādīšana Latvijā. Daikin, Hisense, Mitsubishi un citi. Montāža no 1 dienas.',
    ogLocale: 'lv_LV',
  },
  ru: {
    title: 'AirComfort — Кондиционеры в Латвии',
    description:
      'Профессиональная продажа и установка кондиционеров в Латвии. Daikin, Hisense, Mitsubishi и другие бренды. Монтаж от 1 дня.',
    ogLocale: 'ru_RU',
  },
  en: {
    title: 'AirComfort — Air Conditioners in Latvia',
    description:
      'Professional air conditioner sales and installation in Latvia. Daikin, Hisense, Mitsubishi and other brands. Fitting from 1 day.',
    ogLocale: 'en_US',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = LOCALE_META[locale] ?? LOCALE_META.lv;
  const url = `${BASE_URL}/${locale}`;

  return {
    title: {
      default: meta.title,
      template: `%s | AirComfort`,
    },
    description: meta.description,
    keywords: ['kondicionētāji', 'кондиционеры', 'air conditioners', 'Latvija', 'Rīga', 'uzstādīšana', 'Daikin', 'Hisense'],
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
      languages: {
        lv: `${BASE_URL}/lv`,
        ru: `${BASE_URL}/ru`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/lv`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: meta.title,
      description: meta.description,
      locale: meta.ogLocale,
      alternateLocale: ['lv_LV', 'ru_RU', 'en_US'].filter((l) => l !== meta.ogLocale),
      siteName: 'AirComfort.lv',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-[#0A1628] text-white font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <TrustBar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingButtons />
          <ScrollToTop />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
