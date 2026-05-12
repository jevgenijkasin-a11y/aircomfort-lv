import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSettings } from '@/lib/supabase';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function HeatPumpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CommercialIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IndustrialIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  );
}

const CAT_META = [
  { tKey: 'home' as const, sk: 'cat_home', slug: 'home', Icon: HomeIcon, accent: '#27C4A0' },
  { tKey: 'heatPump' as const, sk: 'cat_hp', slug: 'heat-pump', Icon: HeatPumpIcon, accent: '#3B82F6' },
  { tKey: 'commercial' as const, sk: 'cat_comm', slug: 'commercial', Icon: CommercialIcon, accent: '#F59E0B' },
  { tKey: 'commercialHeatPump' as const, sk: 'cat_ihp', slug: 'service', Icon: IndustrialIcon, accent: '#8B5CF6' },
] as const;

export default async function Categories() {
  const [t, locale, settings] = await Promise.all([
    getTranslations('categories'),
    getLocale(),
    getSettings(),
  ]);

  const title = settings[`cats_title_${locale}`] || t('title');
  const subtitle = settings[`cats_subtitle_${locale}`] || t('subtitle');

  const cards = CAT_META.map(({ tKey, sk, slug, Icon, accent }) => ({
    slug,
    Icon,
    accent,
    name: settings[`${sk}_${locale}`] || t(tKey),
    desc: settings[`${sk}_desc_${locale}`] || t(`${tKey}Desc` as `${typeof tKey}Desc`),
    explore: t('explore'),
  }));

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#1A6B9A]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-syne font-bold text-3xl sm:text-4xl mb-3">{title}</h2>
          <p className="text-white/45 text-lg">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ slug, Icon, accent, name, desc, explore }) => (
            <Link
              key={slug}
              href={`/catalog?category=${slug}`}
              className="glass-card glass-card-hover rounded-2xl p-7 group flex flex-col"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border"
                style={{
                  background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
                  borderColor: `${accent}30`,
                  color: accent,
                }}
              >
                <Icon />
              </div>
              <h3 className="font-syne font-semibold text-lg mb-2">{name}</h3>
              <p className="text-white/50 text-sm leading-relaxed flex-1">{desc}</p>
              <div
                className="mt-5 flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
                style={{ color: accent }}
              >
                {explore}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
