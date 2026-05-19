import { getTranslations } from 'next-intl/server';

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-4 h-4 text-[#00C2E0]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function Reviews() {
  const t = await getTranslations('reviews');

  const reviews = [
    { name: t('r1name'), text: t('r1text'), date: t('r1date'), initials: 'AK' },
    { name: t('r2name'), text: t('r2text'), date: t('r2date'), initials: 'ES' },
    { name: t('r3name'), text: t('r3text'), date: t('r3date'), initials: 'MB' },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#1A6FF4]/6 blur-[80px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="font-syne font-bold text-3xl sm:text-4xl mb-3">{t('title')}</h2>
          <p className="text-white/45 text-base">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <StarRating />
              <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#1A6B9A]/20">
                <div className="w-9 h-9 rounded-full bg-[#1A6FF4]/20 border border-[#1A6FF4]/30 flex items-center justify-center text-[#00C2E0] text-xs font-bold flex-shrink-0">
                  {r.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-white/35">{r.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
