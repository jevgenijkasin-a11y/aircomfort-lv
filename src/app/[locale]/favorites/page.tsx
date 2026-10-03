export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSettings } from '@/lib/db';
import { localizedAlternates } from '@/lib/seo';
import FavoritesView from '@/components/FavoritesView';
import ListPageHeader from '@/components/ListPageHeader';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });
  // Personal list stored in the browser: not a page for search engines
  return { title: t('favTitle'), alternates: localizedAlternates(locale, '/favorites'), robots: { index: false, follow: true } };
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, settings] = await Promise.all([getTranslations('shop'), getSettings()]);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  return (
    <>
      <ListPageHeader title={t('favTitle')} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <FavoritesView locale={locale} installFrom={installFrom} />
      </div>
    </>
  );
}
