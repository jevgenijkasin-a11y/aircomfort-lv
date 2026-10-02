export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSettings } from '@/lib/db';
import { BASE_URL } from '@/lib/seo';
import { breadcrumbJsonLd, jsonLdString, absUrl } from '@/lib/productSeo';
import { renderMarkdown, extractFaq, excerpt, articleLocales, type Article, type Loc } from '@/lib/articles';
import { asLoc, articleAlternates, publicArticle, publishedDate, relatedProducts } from '@/lib/blogData';
import { organizationNode, ORG_ID, WEBSITE_ID } from '@/lib/company';
import { siteConfig } from '@/config/site';
import { ProductGrid } from '@/components/ProductGrid';
import { toCards } from '@/lib/productCard';
import { ArticleCover, CategoryIcon } from '@/components/BlogList';
import OrderLink from '@/components/OrderLink';
import { PageLocales } from '@/lib/pageLocales';

type Props = { params: Promise<{ locale: string; slug: string }> };

const OG_LOCALE: Record<Loc, string> = { lv: 'lv_LV', ru: 'ru_RU', en: 'en_US' };
const description = (a: Article, l: Loc) => a[`meta_description_${l}`] || excerpt(a[`body_${l}`], 160);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = publicArticle(slug, locale);
  if (!a) return { title: 'AirComfort', robots: { index: false } };
  const l = asLoc(locale);
  const metaTitle = a[`meta_title_${l}`] || a[`title_${l}`];
  const desc = description(a, l);
  const alternates = articleAlternates(a, locale);
  return {
    // The brand suffix from the layout template only when the title stays short
    title: (metaTitle + ' | AirComfort').length <= 65 ? metaTitle : { absolute: metaTitle },
    description: desc,
    alternates,
    openGraph: {
      type: 'article',
      url: alternates.canonical as string,
      title: metaTitle,
      description: desc,
      locale: OG_LOCALE[l],
      siteName: 'AirComfort',
      publishedTime: publishedDate(a),
      modifiedTime: a.updated_at,
      ...(a.cover_url ? { images: [{ url: absUrl(a.cover_url) }] } : {}),
    },
  };
}

function articleJsonLd(a: Article, l: Loc, url: string, settings: Record<string, string>) {
  const faq = extractFaq(a[`body_${l}`]);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(settings),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
        headline: a[`title_${l}`].slice(0, 110),
        description: description(a, l),
        inLanguage: l,
        articleSection: a.category,
        datePublished: publishedDate(a),
        dateModified: a.updated_at,
        image: [absUrl(a.cover_url || siteConfig.image)],
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': WEBSITE_ID },
      },
      ...(faq.length
        ? [{
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            url,
            inLanguage: l,
            mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }]
        : []),
    ],
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const a = publicArticle(slug, locale);
  if (!a) notFound();
  const l = asLoc(locale);
  const [t, tn, settings, products] = await Promise.all([
    getTranslations('blog'), getTranslations('nav'), getSettings(), relatedProducts(a),
  ]);
  const url = `${BASE_URL}/${locale}/blog/${a.slug}`;
  const title = a[`title_${l}`];
  const installFrom = parseInt(settings.install_price_from || '250') || 250;

  return (
    <>
      <PageLocales locales={articleLocales(a)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd(a, l, url, settings)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd([
        { name: tn('home'), url: `${BASE_URL}/${locale}` },
        { name: tn('blog'), url: `${BASE_URL}/${locale}/blog` },
        { name: title, url },
      ])) }} />

      <article>
        <header className="pt-36 pb-8 bg-gradient-to-b from-surface to-page relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <li className="flex items-center gap-1.5"><Link href="/" className="hover:text-primary transition-colors">{tn('home')}</Link><span aria-hidden="true">/</span></li>
                <li className="flex items-center gap-1.5"><Link href="/blog" className="hover:text-primary transition-colors">{tn('blog')}</Link><span aria-hidden="true">/</span></li>
                <li className="min-w-0"><span aria-current="page" className="line-clamp-1">{title}</span></li>
              </ol>
            </nav>
            <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/25 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <CategoryIcon category={a.category} className="w-3.5 h-3.5" />{t(a.category)}
            </span>
            {/* Dates are not shown to visitors; search engines get them from JSON-LD and the sitemap */}
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight">{title}</h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          {a.cover_url && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-line mb-8 bg-surface">
              <ArticleCover cover={a.cover_url} category={a.category} alt={title} sizes="(min-width: 768px) 720px, 100vw" priority />
            </div>
          )}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(a[`body_${l}`]) }} />
          <p className="mt-10">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5M18 12H6" /></svg>
              {t('back')}
            </Link>
          </p>
        </div>
      </article>

      {products.length > 0 && (
        <section aria-labelledby="related-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h2 id="related-title" className="font-heading font-bold text-2xl sm:text-3xl">{t('related')}</h2>
            {a.related_catalog && (
              <Link href={a.related_catalog as '/catalog'} className="text-sm font-semibold text-primary hover:underline">{t('seeAll')} →</Link>
            )}
          </div>
          <ProductGrid products={toCards(products, locale)} locale={locale} installFrom={installFrom} />
        </section>
      )}

      {/* Brand navy CTA banner in both themes, like the home page */}
      <section data-theme="dark" className="section-padding bg-ink text-fg relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4 leading-tight">
            <span className="gradient-text">{t('ctaTitle')}</span>
          </h2>
          <p className="text-muted text-lg mb-8 max-w-xl mx-auto">{t('ctaText')}</p>
          <OrderLink
            service="consultation"
            message={t('ctaMessage', { title })}
            className="magnetic inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-on-primary font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-glow/25"
          >
            {t('ctaButton')}
          </OrderLink>
        </div>
      </section>
    </>
  );
}
