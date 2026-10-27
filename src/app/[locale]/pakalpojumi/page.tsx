// Services hub: /[lang]/pakalpojumi — the list of service pages.
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localizedAlternates, pageTitle, clipDescription, BASE_URL } from '@/lib/seo';
import { asLoc, breadcrumbJsonLd, jsonLdString } from '@/lib/productSeo';
import { paragraphs, servicePath, SERVICES_HUB, SERVICE_TX } from '@/lib/services';
import { allServices, publicServices, servicePrice } from '@/lib/serviceData';
import { socialMeta } from '@/lib/pagination';
import OrderLink from '@/components/OrderLink';

type Props = { params: Promise<{ locale: string }> };

const HUB = {
  title: { lv: 'Kondicionieru un siltumsūkņu pakalpojumi', ru: 'Услуги: кондиционеры и тепловые насосы', en: 'Air conditioner and heat pump services' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = asLoc(locale);
  const t = await getTranslations({ locale, namespace: 'services' });
  const description = clipDescription(`${t('subtitle')}. ${allServices().map((s) => s[`title_${l}`]).join(', ')}.`) ?? '';
  return {
    title: pageTitle(HUB.title[l]),
    description,
    alternates: localizedAlternates(locale, SERVICES_HUB),
    ...socialMeta(locale, SERVICES_HUB, `${HUB.title[l]} | AirComfort`, description),
    // Indexed once at least one service page is out of draft
    ...(publicServices().length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function ServicesHub({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [tn, t] = await Promise.all([getTranslations('nav'), getTranslations('services')]);
  const services = allServices();
  const prices = await Promise.all(services.map(servicePrice));
  const crumbs = [
    { name: tn('home'), url: `${BASE_URL}/${locale}` },
    { name: SERVICE_TX.hub[l], url: `${BASE_URL}/${locale}${SERVICES_HUB}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd(crumbs)) }} />
      <div className="pt-36 pb-8 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <li className="flex items-center gap-1.5"><Link href="/" className="hover:text-primary transition-colors">{tn('home')}</Link><span aria-hidden="true">/</span></li>
              <li><span aria-current="page">{SERVICE_TX.hub[l]}</span></li>
            </ol>
          </nav>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl mb-4">{HUB.title[l]}</h1>
          <p className="text-muted text-lg max-w-3xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ul className="grid gap-6 md:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.slug} className="glass-card product-card-hover rounded-2xl p-6 sm:p-7 flex flex-col">
              <h2 className="font-heading font-bold text-xl mb-2">
                <Link href={servicePath(s.slug) as any} className="hover:text-primary transition-colors">{s[`title_${l}`]}</Link>
              </h2>
              <p className="text-muted text-sm leading-relaxed flex-1">{paragraphs(s[`intro_${l}`])[0]}</p>
              {prices[i] ? <p className="font-heading font-bold text-xl text-primary mt-4">{SERVICE_TX.from[l](prices[i]!)}</p> : null}
              <Link href={servicePath(s.slug) as any} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t('more')} →
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12 glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-heading font-semibold text-lg">{t('consultationDesc')}</p>
          <OrderLink service="consultation" message="" className="flex-shrink-0 bg-primary hover:bg-primary-hover text-on-primary font-bold px-6 py-3 rounded-xl transition-colors">
            {tn('getQuote')}
          </OrderLink>
        </div>
      </div>
    </>
  );
}
