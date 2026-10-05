export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localizedAlternates, BASE_URL, pageTitle, clipDescription, blogRssTypes } from '@/lib/seo';
import { breadcrumbJsonLd, jsonLdString } from '@/lib/productSeo';
import { excerpt } from '@/lib/articles';
import { asLoc, publishedArticles } from '@/lib/blogData';
import { blogLocales } from '@/lib/db';
import BlogList, { type BlogCard } from '@/components/BlogList';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const empty = publishedArticles(locale).length === 0;
  return {
    title: pageTitle(t('metaTitle')),
    description: clipDescription(t('metaDescription')),
    alternates: { ...localizedAlternates(locale, '/blog'), types: blogRssTypes(locale, t('metaTitle')) },
    // A language without articles yet stays out of the index
    ...(empty ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = asLoc(locale);
  const [t, tn] = await Promise.all([getTranslations('blog'), getTranslations('nav')]);

  const cards: BlogCard[] = publishedArticles(locale).map((a) => ({
    slug: a.slug,
    category: a.category,
    title: a[`title_${l}`],
    description: a[`meta_description_${l}`] || excerpt(a[`body_${l}`]),
    cover: a.cover_url,
  }));
  const otherLocales = cards.length ? [] : Array.from(blogLocales()).filter((x) => x !== locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd([
        { name: tn('home'), url: `${BASE_URL}/${locale}` },
        { name: tn('blog'), url: `${BASE_URL}/${locale}/blog` },
      ])) }} />
      <div className="pt-36 pb-10 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <li className="flex items-center gap-1.5"><Link href="/" className="hover:text-primary transition-colors">{tn('home')}</Link><span aria-hidden="true">/</span></li>
              <li><span aria-current="page">{tn('blog')}</span></li>
            </ol>
          </nav>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-5">{t('title')}</h1>
          <p className="max-w-3xl text-muted text-base sm:text-lg leading-relaxed">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        {cards.length === 0 && otherLocales.length > 0 ? (
          <div className="glass-card rounded-2xl p-6">
            <p className="text-muted mb-4">{t('emptyLocale')}</p>
            <div className="flex flex-wrap gap-2">
              {otherLocales.map((x) => (
                <Link key={x} href="/blog" locale={x as 'lv' | 'ru' | 'en'} className="inline-block text-sm font-semibold bg-primary text-on-primary px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors">
                  {t('readIn')} {x.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <BlogList
            cards={cards}
            labels={{ all: t('all'), filter: t('filterLabel'), empty: t('empty'), readMore: t('readMore'), cooling: t('cooling'), heating: t('heating'), subsidy: t('subsidy') }}
          />
        )}
      </div>
    </>
  );
}
