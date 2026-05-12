import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['lv', 'ru', 'en'] as const,
  defaultLocale: 'lv',
});

export type Locale = (typeof routing.locales)[number];
