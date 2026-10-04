import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { getSettings } from '@/lib/db';
import { getCompany } from '@/lib/company';
import { pageTitle } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: pageTitle(t('title')) };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, settings] = await Promise.all([
    getTranslations('privacy'),
    getTranslations('contacts'),
    getSettings(),
  ]);
  const company = getCompany(settings, locale);

  const sections = [
    { title: t('s1title'), body: t('s1body') },
    { title: t('s2title'), body: t('s2body') },
    { title: t('s3title'), body: t('s3body') },
    { title: t('s4title'), body: t('s4body') },
    { title: t('s5title'), body: t('s5body') },
  ];

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-primary hover:text-fg text-sm mb-10 transition-colors">
          {t('back')}
        </Link>

        <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-3">{t('title')}</h1>
        <p className="text-muted text-sm mb-12">{t('updated')}</p>

        <p className="text-muted leading-relaxed mb-10">{t('intro')}</p>

        <div className="space-y-8">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="font-heading font-semibold text-lg mb-3 text-fg">{title}</h2>
              <p className="text-muted leading-relaxed">{body}</p>
            </section>
          ))}

          <section>
            <h2 className="font-heading font-semibold text-lg mb-3 text-fg">{t('s6title')}</h2>
            <p className="text-muted leading-relaxed mb-4">{t('s6body')}</p>
            <ul className="space-y-1 text-muted text-sm">
              <li>
                <span className="text-muted">Email: </span>
                <a href={`mailto:${company.email}`} className="text-primary hover:text-fg transition-colors">
                  {company.email}
                </a>
              </li>
              <li>
                <span className="text-muted">{tc('phone')}: </span>
                <a href={company.phoneHref} className="text-primary hover:text-fg transition-colors">
                  {company.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="text-muted">{tc('address')}: </span>
                <span>{company.address}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
