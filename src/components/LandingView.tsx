import { Link } from '@/i18n/navigation';
import { ProductGrid } from '@/components/ProductGrid';
import Pagination from '@/components/Pagination';
import ViewToggle from '@/components/ViewToggle';
import type { SupabaseProduct } from '@/lib/types';
import { toCards } from '@/lib/productCard';
import { breadcrumbJsonLd, jsonLdString } from '@/lib/productSeo';
import { itemListJsonLd } from '@/lib/pagination';

type Crumb = { name: string; href: string | null; url: string };

/**
 * Server-rendered landing page (brand / category): H1, intro, one page of
 * product links (24, ?page=N), hub links. Only card data reaches the HTML.
 */
export default function LandingView({
  locale, crumbs, h1, intro, products, installFrom, related, emptyText, basePath, page = 1, totalPages = 1, offset = 0,
}: {
  locale: string;
  crumbs: Crumb[];
  h1: string;
  intro: string[];
  /** Products of THIS page only (already sliced) */
  products: SupabaseProduct[];
  installFrom: number;
  related: { title: string; items: { href: string; label: string }[] };
  /** Shown instead of the grid when the section has no products yet. */
  emptyText?: string;
  /** Path of page 1 without locale, e.g. /catalog/type/home-air-conditioners */
  basePath: string;
  page?: number;
  totalPages?: number;
  /** Index of the first product on this page (for ItemList positions) */
  offset?: number;
}) {
  const cards = toCards(products, locale);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd(crumbs.map(({ name, url }) => ({ name, url })))) }} />
      {cards.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd(locale, cards, offset, h1)) }} />
      )}
      <div className="pt-36 pb-10 bg-gradient-to-b from-surface to-page relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href as any} className="hover:text-primary transition-colors">{c.name}</Link>
                  ) : (
                    <span className="text-muted" aria-current="page">{c.name}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-5">{h1}</h1>
          {/* The intro belongs to page 1; further pages are plain product lists */}
          {page === 1 && (
            <div className="max-w-3xl space-y-3">
              {intro.filter(Boolean).map((p, i) => (
                <p key={i} className="text-muted text-base leading-relaxed">{p}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Phones: grid / list switch */}
        {cards.length > 0 && <div className="md:hidden flex justify-end mb-3"><ViewToggle /></div>}
        {cards.length || !emptyText ? (
          <ProductGrid products={cards} locale={locale} installFrom={installFrom} />
        ) : (
          <p className="glass-card rounded-2xl p-6 text-muted">{emptyText}</p>
        )}
        <Pagination basePath={basePath} page={page} totalPages={totalPages} locale={locale} />

        {related.items.length > 0 && (
          // Hidden on phones (long chip list at the page end); links stay in the HTML for crawlers
          <nav aria-label={related.title} className="mt-14 hidden sm:block">
            <h2 className="text-muted text-xs font-semibold uppercase tracking-widest mb-3">{related.title}</h2>
            <ul className="flex flex-wrap gap-2">
              {related.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href as any} className="inline-block text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg px-3 py-1.5 rounded-xl transition-colors">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
