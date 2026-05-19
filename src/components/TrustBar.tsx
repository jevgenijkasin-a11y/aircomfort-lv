import { getTranslations } from 'next-intl/server';

export default async function TrustBar() {
  const t = await getTranslations('trustbar');

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
    <div className="bg-[#051525] border-b border-[#1A6B9A]/20 py-2 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-center gap-5 sm:gap-10 whitespace-nowrap min-w-max mx-auto">
          {items.map(({ key, icon }, i) => (
            <div key={key} className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
              <span className="text-[#27C4A0]">{icon}</span>
              {t(key)}
              {i < items.length - 1 && (
                <span className="w-px h-3 bg-[#1A6B9A]/40 ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
