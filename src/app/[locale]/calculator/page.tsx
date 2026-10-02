export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Calculator from '@/components/Calculator';
import { getSettings } from '@/lib/db';
import { asLoc } from '@/lib/productSeo';
import { listingMetadata } from '@/lib/pagination';

const DESC = {
  lv: 'Bezmaksas kondicioniera jaudas kalkulators: ievadiet telpas platību, siltināšanu un logus — uzzināsiet vajadzīgo jaudu kW, piemērotus modeļus un aptuvenās izmaksas ar montāžu.',
  ru: 'Бесплатный калькулятор мощности кондиционера: укажите площадь, утепление и окна — узнаете нужную мощность в кВт, подходящие модели и примерную стоимость с монтажом.',
  en: 'Free air conditioner size calculator: enter room area, insulation and windows to get the capacity you need in kW, matching models and an estimated price with installation.',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculator' });
  return listingMetadata({ locale, path: '/calculator', title: t('title'), description: DESC[asLoc(locale)] });
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tn, settings] = await Promise.all([
    getTranslations('calculator'),
    getTranslations('nav'),
    getSettings(),
  ]);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  const installTo = parseInt(settings.install_price_to || '350') || 350;

  return (
    <>
      <div className="pt-36 pb-10 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-[80px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            {tn('calculator')}
          </p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-3">{t('title')}</h1>
          <p className="text-muted text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>
      {/* Matching models are fetched from /api/calc-models when the user calculates */}
      <Calculator installFrom={installFrom} installTo={installTo} locale={locale} />
    </>
  );
}
