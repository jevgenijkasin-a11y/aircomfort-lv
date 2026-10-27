// Old address of admin-managed categories → /catalog/<slug> or /catalog/<parent>/<sub> (permanent).
export const dynamic = 'force-dynamic';

import { redirectToCategory } from '@/lib/categoryRedirect';

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OldCategoryPage({ params, searchParams }: Props) {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  redirectToCategory(locale, { slug }, sp);
}
