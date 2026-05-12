import type { Metadata } from 'next';
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server';
import { supabaseServer, type SupabaseProduct } from '@/lib/supabase';
import CatalogClient from '@/components/CatalogClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('catalog');
  return { title: t('title') };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: routeLocale } = await params;
  setRequestLocale(routeLocale);

  const [t, locale, { data: products }, sp] = await Promise.all([
    getTranslations('catalog'),
    getLocale(),
    supabaseServer.from('products').select('*').eq('in_stock', true).order('price', { ascending: true }),
    searchParams,
  ]);

  return (
    <>
      <div className="pt-28 pb-10 bg-gradient-to-b from-[#051e31] to-[#072D47] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#1A6B9A]/10 blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-[#27C4A0] text-sm font-semibold uppercase tracking-widest mb-3">{t('title')}</p>
          <h1 className="font-syne font-bold text-4xl sm:text-5xl mb-3">{t('title')}</h1>
          <p className="text-white/45 text-lg">{t('subtitle')}</p>
        </div>
      </div>
      <CatalogClient initialProducts={(products ?? []) as SupabaseProduct[]} locale={locale} initialCategory={sp.category} />
    </>
  );
}
