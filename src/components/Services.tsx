import { getTranslations, getLocale } from 'next-intl/server';
import { getSettings } from '@/lib/db';

function SupplyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

function InstallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function MaintenanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ConsultIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

const serviceIcons = [SupplyIcon, InstallIcon, MaintenanceIcon, ConsultIcon];
const serviceKeys = ['supply', 'installation', 'maintenance', 'consultation'] as const;
const settingsKeys = ['svc_supply', 'svc_install', 'svc_maint', 'svc_consult'] as const;

export default async function Services() {
  const [t, locale, settings] = await Promise.all([
    getTranslations('services'),
    getLocale(),
    getSettings(),
  ]);

  const title = settings[`services_title_${locale}`] || t('title');
  const subtitle = settings[`services_subtitle_${locale}`] || t('subtitle');

  const cards = serviceKeys.map((key, i) => {
    const sk = settingsKeys[i];
    const Icon = serviceIcons[i];
    const descKey = `${key}Desc` as `${typeof key}Desc`;
    return {
      Icon,
      name: settings[`${sk}_${locale}`] || t(key),
      desc: settings[`${sk}_desc_${locale}`] || t(descKey),
    };
  });

  return (
    <section className="section-padding bg-[#051e31] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#1A6B9A]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-14">
          <h2 className="font-syne font-bold text-3xl sm:text-4xl mb-3">{title}</h2>
          <p className="text-white/45 text-lg">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ Icon, name, desc }, i) => (
            <div key={name} className="reveal glass-card product-card-hover rounded-2xl p-7 group h-full flex flex-col" data-stagger={i}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#27C4A0]/20 to-[#1A6B9A]/10 border border-[#27C4A0]/20 flex items-center justify-center text-[#27C4A0] mb-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Icon />
              </div>
              <h3 className="font-syne font-semibold text-lg mb-2">{name}</h3>
              <p className="text-white/50 text-sm leading-relaxed flex-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
