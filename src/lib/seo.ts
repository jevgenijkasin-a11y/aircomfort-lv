import type { Metadata } from 'next';

export const BASE_URL = 'https://aircomfort.lv';
const LOCALES = ['lv', 'ru', 'en'] as const;

// ── title / description length (Bing: "Title too long" over 65 chars) ──
export const TITLE_MAX = 65;
export const DESCRIPTION_MAX = 160;
export const SITE_SUFFIX = ' | AirComfort';

/** Shortens text to `max` characters at a word boundary, ending with "…". */
function cutAtWord(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const room = max - 1; // the "…"
  let out = '';
  for (const word of t.split(' ')) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > room) break;
    out = next;
  }
  if (!out) out = t.slice(0, room); // one very long word
  return out.replace(/[\s,;:—–\-/(+]+$/, '') + '…';
}

/**
 * Full page title, at most 65 characters: `main` is cut at the last whole
 * word (with "…") so that the brand suffix always stays.
 */
export function buildTitle(main: string, suffix = SITE_SUFFIX): string {
  const m = main.replace(/\s+/g, ' ').trim();
  if ((m + suffix).length <= TITLE_MAX) return m + suffix;
  return cutAtWord(m, TITLE_MAX - suffix.length) + suffix;
}

/** Next.js metadata title (absolute: the layout template must not add the suffix again). */
export const pageTitle = (main: string, suffix = SITE_SUFFIX) => ({ absolute: buildTitle(main, suffix) });

/** Meta description of at most 160 characters, cut at a word. */
export const clipDescription = (text: string | undefined | null, max = DESCRIPTION_MAX) =>
  text ? cutAtWord(text, max) : undefined;

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

/** <link rel="alternate" type="application/rss+xml"> of the blog feed in this language. */
export const blogRssTypes = (locale: string, title: string) => ({
  'application/rss+xml': [{ url: `${BASE_URL}/${locale}/blog/rss.xml`, title }],
});
