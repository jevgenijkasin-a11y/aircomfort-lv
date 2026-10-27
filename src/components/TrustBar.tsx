import { getTranslations } from 'next-intl/server';

/** Thin brand-navy strip above the header (same in both themes). */
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

  const item = (key: string, icon: JSX.Element) => (
    <>
      <span className="text-primary shrink-0">{icon}</span>
      <span>{t(key)}</span>
    </>
  );

  return (
    // data-theme="dark": tokens inside always resolve to the dark palette
    <div data-theme="dark" className="bg-ink text-fg border-b border-line py-2 relative z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* 400 px and wider: the three points side by side (as before) */}
        <div className="hidden min-[400px]:flex items-center justify-center gap-2 sm:gap-8">
          {items.map(({ key, icon }, i) => (
            <div key={key} className="flex items-center gap-1 sm:gap-2 text-muted text-[11px] sm:text-sm font-medium shrink-0">
              {item(key, icon)}
              {i < items.length - 1 && (
                <span className="w-px h-3 bg-line ml-1 sm:ml-4 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Narrower than 400 px the line does not fit: a slow ticker (two copies loop seamlessly) … */}
      <div className="tb-ticker min-[400px]:hidden overflow-hidden">
        <div className="tb-ticker-inner flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0" {...(copy ? { 'aria-hidden': true } : {})}>
              {items.map(({ key, icon }) => (
                <li key={key} className="flex items-center gap-1 text-muted text-[11px] font-medium shrink-0 px-4">{item(key, icon)}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {/* … or, with reduced motion, one point at a time without movement */}
      <ul className="tb-single min-[400px]:hidden relative h-4">
        {items.map(({ key, icon }, i) => (
          <li key={key} className="tb-single-item absolute inset-0 flex items-center justify-center gap-1 text-muted text-[11px] font-medium" style={{ animationDelay: `${i * 4}s` }}>
            {item(key, icon)}
          </li>
        ))}
      </ul>

      <style>{`
        .tb-ticker-inner { animation: tb-scroll 22s linear infinite; }
        @keyframes tb-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tb-single { display: none; }
        .tb-single-item { opacity: 0; animation: tb-one 12s step-end infinite; }
        @keyframes tb-one { 0% { opacity: 1; } 33.333% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .tb-ticker { display: none; }
          .tb-single { display: block; }
        }
        @media (min-width: 400px) { .tb-single { display: none !important; } }
      `}</style>
    </div>
  );
}
