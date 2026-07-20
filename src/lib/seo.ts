import type { Metadata } from 'next';

export const BASE_URL = 'https://aircomfort.lv';
const LOCALES = ['lv', 'ru', 'en'] as const;

/**
 * Builds the canonical + hreflang alternates for a page.
 *
 * @param locale current locale (lv/ru/en)
 * @param path   path AFTER the locale segment, e.g. '' for the home page,
 *               '/catalog', or '/catalog/<id>'. No trailing slash, no locale.
 */
export function localizedAlternates(locale: string, path = ''): NonNullable<Metadata['alternates']> {
  const clean = path && !path.startsWith('/') ? `/${path}` : path;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${BASE_URL}/${l}${clean}`;
  languages['x-default'] = `${BASE_URL}/lv${clean}`;
  return {
    canonical: `${BASE_URL}/${locale}${clean}`,
    languages,
  };
}
