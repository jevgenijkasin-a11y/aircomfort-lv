import { Link } from '@/i18n/navigation';
import { ProductGrid } from '@/components/CatalogClient';
import type { SupabaseProduct } from '@/lib/types';
import { breadcrumbJsonLd, jsonLdString } from '@/lib/productSeo';

type Crumb = { name: string; href: string | null; url: string };

/** Server-rendered landing page (brand / category): H1, intro, product links, hub links. */
export default function LandingView({
  locale, crumbs, h1, intro, products, installFrom, related, emptyText,
}: {
  locale: string;
  crumbs: Crumb[];
  h1: string;
  intro: string[];
  products: SupabaseProduct[];
  installFrom: number;
  related: { title: string; items: { href: string; label: string }[] };
  /** Shown instead of the grid when the section has no products yet. */
  emptyText?: string;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd(crumbs.map(({ name, url }) => ({ name, url })))) }} />
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
          <div className="max-w-3xl space-y-3">
            {intro.filter(Boolean).map((p, i) => (
              <p key={i} className="text-muted text-base leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {products.length || !emptyText ? (
          <ProductGrid products={products} locale={locale} installFrom={installFrom} />
        ) : (
          <p className="glass-card rounded-2xl p-6 text-muted">{emptyText}</p>
        )}

        {related.items.length > 0 && (
          <nav aria-label={related.title} className="mt-14">
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
