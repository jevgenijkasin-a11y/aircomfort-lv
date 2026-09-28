import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/lib/db';

/** Thin brand-navy strip above the header (same in both themes). */
export default async function TrustBar() {
  const [t, tc, settings] = await Promise.all([getTranslations('trustbar'), getTranslations('contacts'), getSettings()]);
  const phone = settings.phone || tc('phoneValue');

  const items = [
    {
      key: 'warranty',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: 'installation',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'consultation',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ] as const;

  return (
    // data-theme="dark": tokens inside always resolve to the dark palette
    <div data-theme="dark" className="bg-ink text-fg border-b border-line py-2 relative z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-center lg:justify-between gap-4">
        <div className="flex items-center justify-center gap-2 sm:gap-8">
          {items.map(({ key, icon }, i) => (
            <div key={key} className="flex items-center gap-1 sm:gap-2 text-muted text-[11px] sm:text-sm font-medium shrink-0">
              <span className="text-primary shrink-0">{icon}</span>
              <span>{t(key)}</span>
              {i < items.length - 1 && (
                <span className="w-px h-3 bg-line ml-1 sm:ml-4 shrink-0" />
              )}
            </div>
          ))}
        </div>
        <a href={`tel:${phone.replace(/\s/g, '')}`} className="hidden lg:inline-flex items-center gap-1.5 text-sm font-semibold text-fg hover:text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          {phone}
        </a>
      </div>
    </div>
  );
}
