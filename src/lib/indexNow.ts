// IndexNow: tells Bing / Yandex (and other IndexNow engines) right away that
// pages were added or changed. Server-only. Active only when INDEXNOW_KEY is
// set (on the live server); the same key must be served at /<key>.txt.
// Never throws: errors are only logged, saving is never blocked.
import { BASE_URL } from './seo';

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const LOCALES = ['lv', 'ru', 'en'] as const;

/** Absolute URLs for a path (after the locale) in the given locales. */
export const localizedUrls = (path: string, locales: readonly string[] = LOCALES) =>
  locales.map((l) => `${BASE_URL}/${l}${path}`);

/** Host of an incoming request (behind the Plesk proxy: X-Forwarded-Host). */
export const requestHost = (req: Request) => req.headers.get('x-forwarded-host') || req.headers.get('host');

/**
 * @param urls    absolute page URLs
 * @param reqHost host the admin request came to — only saves made on the live
 *                domain are reported (a local `next start` loads the same env)
 */
export function notifyIndexNow(urls: string[], reqHost: string | null): void {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || !urls.length) return;
  const siteHost = new URL(BASE_URL).host;
  const host = (reqHost ?? '').split(',')[0].trim().replace(/:\d+$/, '').toLowerCase();
  if (host !== siteHost && host !== `www.${siteHost}`) {
    console.log(`[indexnow] skipped (host ${host || '?'}): ${urls.join(', ')}`);
    return;
  }
  const body = {
    host: siteHost,
    key,
    keyLocation: `${BASE_URL}/${key}.txt`,
    urlList: Array.from(new Set(urls)),
  };
  // Fire and forget: the admin response does not wait for the search engines
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
    .then((r) => {
      if (r.ok) console.log(`[indexnow] ${r.status} sent ${body.urlList.length} URL(s)`);
      else console.error(`[indexnow] HTTP ${r.status} for ${body.urlList.join(', ')}`);
    })
    .catch((e) => console.error('[indexnow] request failed:', (e as Error).message));
}
