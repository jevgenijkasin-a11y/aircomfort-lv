// Subcategory pages: /catalog/<parent>/<sub>, e.g. /catalog/fan-coils/cassette
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import CategoryListing, { categoryListingMetadata } from '@/components/CategoryListing';

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string; id: string; sub: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale, id, sub }, sp] = await Promise.all([params, searchParams]);
  return categoryListingMetadata(locale, [id, sub], sp);
}

export default async function SubcategoryPage({ params, searchParams }: Props) {
  const [{ locale, id, sub }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  return <CategoryListing locale={locale} segments={[id, sub]} sp={sp} />;
}
