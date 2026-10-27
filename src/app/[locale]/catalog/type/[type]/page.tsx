// Old address of the four original categories → /catalog/<slug> (permanent).
export const dynamic = 'force-dynamic';

import { redirectToCategory } from '@/lib/categoryRedirect';

type Props = { params: Promise<{ locale: string; type: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OldTypePage({ params, searchParams }: Props) {
  const [{ locale, type }, sp] = await Promise.all([params, searchParams]);
  redirectToCategory(locale, { slug: type }, sp);
}
