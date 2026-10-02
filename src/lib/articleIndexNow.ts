// IndexNow URLs for an article save: the public pages that appeared, changed
// or disappeared (unpublished / renamed / deleted ones are reported too, so
// search engines re-crawl them and see the 404).
import { type Article, articleLocales } from './articles';
import { BASE_URL } from './seo';

const pages = (a: Article | null) =>
  a && a.is_published ? articleLocales(a).flatMap((l) => [`${BASE_URL}/${l}/blog/${a.slug}`, `${BASE_URL}/${l}/blog`]) : [];

export const articleIndexNowUrls = (before: Article | null, after: Article | null) => Array.from(new Set([...pages(before), ...pages(after)]));
