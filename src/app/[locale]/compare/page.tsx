export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localizedAlternates } from '@/lib/seo';
import CompareView from '@/components/CompareView';
import ListPageHeader from '@/components/ListPageHeader';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });
  // Personal list stored in the browser: not a page for search engines
  return { title: t('cmpTitle'), alternates: localizedAlternates(locale, '/compare'), robots: { index: false, follow: true } };
}

export default async function ComparePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('shop');
  return (
    <>
      <ListPageHeader title={t('cmpTitle')} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <CompareView locale={locale} />
      </div>
    </>
  );
}
