import { getTranslations, getLocale } from 'next-intl/server';
import { supabaseServer, type SupabaseReview } from '@/lib/supabase';

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-4 h-4 ${i <= count ? 'text-[#00C2E0]' : 'text-white/15'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default async function Reviews() {
  const [t, locale] = await Promise.all([getTranslations('reviews'), getLocale()]);

  const { data } = await supabaseServer
    .from('reviews')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(6);

  type ReviewItem = { id: string | number; author_name: string; text: string; rating: number; dateStr?: string; fromDb: boolean };

  let items: ReviewItem[];

  if (data && data.length > 0) {
    items = (data as SupabaseReview[]).map((r) => ({
      id: r.id,
      author_name: r.author_name,
      text: (locale === 'lv' ? r.text_lv : locale === 'ru' ? r.text_ru : r.text_en) || r.text_ru || r.text_lv || r.text_en,
      rating: r.rating,
      dateStr: r.created_at,
      fromDb: true,
    }));
  } else {
    items = [
      { id: 's1', author_name: t('r1name'), text: t('r1text'), rating: 5, dateStr: t('r1date'), fromDb: false },
      { id: 's2', author_name: t('r2name'), text: t('r2text'), rating: 5, dateStr: t('r2date'), fromDb: false },
      { id: 's3', author_name: t('r3name'), text: t('r3text'), rating: 5, dateStr: t('r3date'), fromDb: false },
    ];
  }

  if (!items.length) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#1A6FF4]/6 blur-[80px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="font-syne font-bold text-3xl sm:text-4xl mb-3">{t('title')}</h2>
          <p className="text-white/45 text-base">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <StarRating count={r.rating} />
              <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#1A6B9A]/20">
                <div className="w-9 h-9 rounded-full bg-[#1A6FF4]/20 border border-[#1A6FF4]/30 flex items-center justify-center text-[#00C2E0] text-xs font-bold flex-shrink-0">
                  {getInitials(r.author_name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.author_name}</p>
                  {r.dateStr && (
                    <p className="text-xs text-white/35">
                      {r.fromDb
                        ? new Date(r.dateStr).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'lv' ? 'lv-LV' : 'en-GB', { month: 'long', year: 'numeric' })
                        : r.dateStr}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
