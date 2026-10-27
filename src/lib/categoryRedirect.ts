// Old category addresses (/catalog/type/<slug>, /catalog/category/<slug>,
// /catalog?category=<key>) → permanent redirect to /catalog/<slug>.
import { notFound, permanentRedirect } from 'next/navigation';
import { listCategories } from './db';
import { categoryPath, hiddenKeys } from './categories';

type SP = Record<string, string | string[] | undefined>;

/** Query string without the given keys ("?brand=LG&page=2" or ""). */
export function queryWithout(sp: SP, drop: string[] = []): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined || drop.includes(k)) continue;
    for (const x of Array.isArray(v) ? v : [v]) p.append(k, x);
  }
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

/** Redirects to the category page of `slug` (or `key`); 404 when unknown or hidden. */
export function redirectToCategory(locale: string, by: { slug?: string; key?: string }, sp: SP, drop: string[] = []): never {
  const cats = listCategories();
  const cat = cats.find((c) => (by.slug ? c.slug === by.slug : c.key === by.key));
  if (!cat || hiddenKeys(cats).has(cat.key)) notFound();
  permanentRedirect(`/${locale}${categoryPath(cats, cat.key)}${queryWithout(sp, drop)}`);
}
