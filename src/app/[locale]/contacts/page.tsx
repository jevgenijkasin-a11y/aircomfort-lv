export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/supabase';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contacts');
  return { title: t('title') };
}

function InfoCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#27C4A0]/10 border border-[#27C4A0]/20 flex items-center justify-center text-[#27C4A0] flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white font-medium text-sm">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, settings] = await Promise.all([getTranslations('contacts'), getSettings()]);

  const phone = settings.phone || t('phoneValue');
  const email = settings.email || t('emailValue');
  const address = settings.address || t('addressValue');
  const hours = settings.hours || t('hoursValue');

  const titleKey = `contacts_title_${locale}` as const;
  const subtitleKey = `contacts_subtitle_${locale}` as const;
  const formTitleKey = `contacts_form_title_${locale}` as const;
  const pageTitle = settings[titleKey] || t('title');
  const pageSubtitle = settings[subtitleKey] || t('subtitle');
  const formTitle = settings[formTitleKey] || t('form.title');

  return (
    <>
      <div className="pt-36 pb-10 bg-gradient-to-b from-[#051e31] to-[#072D47] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-[#1A6B9A]/10 blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-[#27C4A0] text-sm font-semibold uppercase tracking-widest mb-3">{pageTitle}</p>
          <h1 className="font-syne font-bold text-4xl sm:text-5xl mb-3">{pageTitle}</h1>
          <p className="text-white/45 text-lg max-w-xl">{pageSubtitle}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <ContactForm formTitle={formTitle} />
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <InfoCard
                label={t('phone')}
                value={phone}
                href={`tel:${phone}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />
              <InfoCard
                label={t('email')}
                value={email}
                href={`mailto:${email}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <InfoCard
                label={t('address')}
                value={address}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <InfoCard
                label={t('hours')}
                value={hours}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Google Maps embed — address from admin settings */}
            <div className="mt-4 rounded-2xl overflow-hidden border border-[#1A6B9A]/25 h-48">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
