import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
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

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'AirComfort — Kondicionētāji Latvijā',
    template: '%s | AirComfort',
  },
  description:
    'Profesionāla kondicionēšanas iekārtu piegāde un uzstādīšana Latvijā. Daikin, Mitsubishi, Samsung, LG, Panasonic.',
  keywords: ['kondicionētāji', 'кондиционеры', 'air conditioners', 'Latvija', 'Rīga', 'uzstādīšana'],
};

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
    <html lang={locale} className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-[#072D47] text-white font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
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
