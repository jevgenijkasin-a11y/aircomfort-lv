export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Calculator from '@/components/Calculator';
import { getSettings, supabaseServer } from '@/lib/supabase';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('calculator');
  return { title: t('title') };
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tn, settings, { data: productPrices }] = await Promise.all([
    getTranslations('calculator'),
    getTranslations('nav'),
    getSettings(),
    supabaseServer
      .from('products')
      .select('power_kw, price, discount_percent')
      .eq('in_stock', true)
      .gt('price', 0),
  ]);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  const installTo = parseInt(settings.install_price_to || '350') || 350;

  return (
    <>
      <div className="pt-36 pb-10 bg-gradient-to-b from-[#051e31] to-[#072D47] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#27C4A0]/8 blur-[80px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <p className="text-[#27C4A0] text-sm font-semibold uppercase tracking-widest mb-3">
            {tn('calculator')}
          </p>
          <h1 className="font-syne font-bold text-4xl sm:text-5xl mb-3">{t('title')}</h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>
      <Calculator installFrom={installFrom} installTo={installTo} products={(productPrices ?? []) as { power_kw: number; price: number; discount_percent: number | null }[]} />
    </>
  );
}
