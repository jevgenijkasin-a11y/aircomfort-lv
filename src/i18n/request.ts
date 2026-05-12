import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    const headersList = await headers();
    // x-next-intl-locale header contains the locale code directly (e.g. 'ru'), not a path
    const fromHeader = headersList.get('x-next-intl-locale');
    if (fromHeader && routing.locales.includes(fromHeader as (typeof routing.locales)[number])) {
      locale = fromHeader;
    } else {
      locale = routing.defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
