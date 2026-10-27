// Service page: /[lang]/pakalpojumi/<slug> (texts from Admin → Services).
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getServiceBySlug, getSettings, listCategories } from '@/lib/db';
import { localizedAlternates, pageTitle, clipDescription, BASE_URL } from '@/lib/seo';
import { asLoc, breadcrumbJsonLd, jsonLdString } from '@/lib/productSeo';
import { lines, paragraphs, servicePath, SERVICES_HUB, SERVICE_TX } from '@/lib/services';
import { serviceProducts, servicePrice, serviceJsonLd, allServices } from '@/lib/serviceData';
import { categoryPath } from '@/lib/categories';
import { socialMeta } from '@/lib/pagination';
import { ProductGrid } from '@/components/ProductGrid';
import { toCards } from '@/lib/productCard';
import OrderLink from '@/components/OrderLink';
import { starred } from '@/components/FootnoteStar';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = getServiceBySlug(slug);
  if (!s) return { title: 'AirComfort', robots: { index: false } };
  const l = asLoc(locale);
  const title = s[`meta_title_${l}`] || s[`title_${l}`];
  const description = clipDescription(s[`meta_description_${l}`] || paragraphs(s[`intro_${l}`])[0]) ?? '';
  const path = servicePath(s.slug);
  return {
    title: pageTitle(title),
    description: description || undefined,
    alternates: localizedAlternates(locale, path),
    ...socialMeta(locale, path, `${title} | AirComfort`, description),
    // Drafts open by direct link but stay out of the index (and the sitemap)
    ...(s.is_draft ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = getServiceBySlug(slug);
  if (!s) notFound();
  const l = asLoc(locale);
  const [tn, tp, settings, price, products] = await Promise.all([
    getTranslations('nav'), getTranslations('products'), getSettings(), servicePrice(s), serviceProducts(s),
  ]);
  const installFrom = parseInt(settings.install_price_from || '250') || 250;
  const title = s[`title_${l}`];
  const intro = paragraphs(s[`intro_${l}`]);
  const includes = lines(s[`includes_${l}`]);
  const steps = lines(s[`steps_${l}`]);
  const warranty = paragraphs(s[`warranty_${l}`]);
  const others = allServices().filter((x) => x.slug !== s.slug);
  const cats = listCategories();
  const firstCat = s.product_categories.split(',').map((k) => k.trim()).find((k) => cats.some((c) => c.key === k));
  const isInstall = s.price_auto;

  const url = `${BASE_URL}/${locale}${servicePath(s.slug)}`;
  const crumbs = [
    { name: tn('home'), href: '/', url: `${BASE_URL}/${locale}` },
    { name: SERVICE_TX.hub[l], href: SERVICES_HUB, url: `${BASE_URL}/${locale}${SERVICES_HUB}` },
    { name: title, href: null, url },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(serviceJsonLd(s, l, price, settings)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd(crumbs.map(({ name, url: u }) => ({ name, url: u })))) }} />

      <div className="pt-36 pb-8 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? <Link href={c.href as any} className="hover:text-primary transition-colors">{c.name}</Link> : <span aria-current="page">{c.name}</span>}
                  {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="font-heading font-bold text-3xl sm:text-5xl mb-5">{title}</h1>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
            <div className="max-w-3xl space-y-3">
              {intro.map((p, i) => <p key={i} className="text-muted text-base sm:text-lg leading-relaxed">{p}</p>)}
            </div>
            {/* Price + call to action */}
            <div className="glass-card rounded-2xl p-6">
              <p className="text-muted text-xs font-semibold uppercase tracking-widest mb-1">{SERVICE_TX.priceLabel[l]}</p>
              <p className="font-heading font-bold text-3xl text-primary mb-1">
                {price ? (isInstall ? starred(`${SERVICE_TX.from[l](price)}*`) : SERVICE_TX.from[l](price)) : <span className="text-xl text-fg">{SERVICE_TX.onRequest[l]}</span>}
              </p>
              {price && isInstall ? <p className="text-muted text-xs mb-5">{starred(tp('installNote'))}</p> : <div className="mb-5" />}
              <OrderLink service={s.contact_service} message={title}
                className="block text-center bg-primary hover:bg-primary-hover text-on-primary font-bold px-6 py-3.5 rounded-xl transition-colors">
                {tn('getQuote')}
              </OrderLink>
              <Link href="/calculator" className="block text-center mt-3 text-sm font-semibold text-primary hover:underline">{SERVICE_TX.calc[l]} →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {(includes.length > 0 || steps.length > 0) && (
          <div className="grid gap-8 md:grid-cols-2">
            {includes.length > 0 && (
              <section className="glass-card rounded-2xl p-6 sm:p-8">
                <h2 className="font-heading font-bold text-2xl mb-5">{SERVICE_TX.includes[l]}</h2>
                <ul className="space-y-3">
                  {includes.map((it, i) => (
                    <li key={i} className="flex gap-3 text-fg">
                      <svg className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {steps.length > 0 && (
              <section className="glass-card rounded-2xl p-6 sm:p-8">
                <h2 className="font-heading font-bold text-2xl mb-5">{SERVICE_TX.steps[l]}</h2>
                <ol className="space-y-4">
                  {steps.map((it, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-fg pt-0.5">{it}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}

        {warranty.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-2xl mb-3">{SERVICE_TX.warranty[l]}</h2>
            <div className="max-w-3xl space-y-3">{warranty.map((p, i) => <p key={i} className="text-muted leading-relaxed">{p}</p>)}</div>
          </section>
        )}

        {products.length > 0 && (
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
              <h2 className="font-heading font-bold text-2xl">{SERVICE_TX.products[l]}</h2>
              {firstCat && <Link href={categoryPath(cats, firstCat) as any} className="text-sm font-semibold text-primary hover:underline">{tp('viewAll')} →</Link>}
            </div>
            <ProductGrid products={toCards(products, locale)} locale={locale} installFrom={installFrom} />
          </section>
        )}

        {others.length > 0 && (
          <nav aria-label={SERVICE_TX.others[l]}>
            <h2 className="text-muted text-xs font-semibold uppercase tracking-widest mb-3">{SERVICE_TX.others[l]}</h2>
            <ul className="flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={servicePath(o.slug) as any} className="inline-block text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg px-3 py-1.5 rounded-xl transition-colors">{o[`title_${l}`]}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
