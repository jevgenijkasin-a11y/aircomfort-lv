'use client';

// Article cards with a topic filter. Every card is in the server HTML; the
// filter only hides cards (no ?category= URLs to index).
import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ArticleCategory } from '@/lib/articles';

export type BlogCard = {
  slug: string;
  category: ArticleCategory;
  title: string;
  description: string;
  cover: string;
};

export function CategoryIcon({ category, className = 'w-5 h-5' }: { category: ArticleCategory; className?: string }) {
  const d = {
    cooling: 'M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11M9 4l3 2 3-2M9 20l3-2 3 2',
    heating: 'M12 22c4 0 7-2.7 7-7 0-3.5-2.3-6-4-8-.3 2-1.2 3.4-2.6 4.1C12.8 8 11.6 4.8 9 2c0 3.8-4 6.6-4 13 0 4.3 3 7 7 7z',
    subsidy: 'M15.5 7.5A5 5 0 1 0 15.5 16.5M5 10.5h8M5 13.5h8',
  }[category];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Cover picture, or a neutral placeholder in the topic colour while there is none. */
export function ArticleCover({ cover, category, alt, sizes, priority = false }: { cover: string; category: ArticleCategory; alt: string; sizes: string; priority?: boolean }) {
  if (cover) return <Image src={cover} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />;
  const tone = category === 'heating' ? 'from-heat/25 to-heat/5 text-heat' : category === 'subsidy' ? 'from-primary/25 to-primary/5 text-primary' : 'from-cool/25 to-cool/5 text-cool';
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${tone} flex items-center justify-center`}>
      <CategoryIcon category={category} className="w-14 h-14 opacity-70" />
    </div>
  );
}

export default function BlogList({ cards, labels }: {
  cards: BlogCard[];
  labels: { all: string; filter: string; empty: string; readMore: string } & Record<ArticleCategory, string>;
}) {
  const [cat, setCat] = useState<ArticleCategory | 'all'>('all');
  const present = (['cooling', 'heating', 'subsidy'] as const).filter((c) => cards.some((a) => a.category === c));
  const shown = cat === 'all' ? cards : cards.filter((a) => a.category === cat);

  return (
    <>
      {present.length > 1 && (
        <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2 mb-8">
          {(['all', ...present] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
                cat === c ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-muted border-line hover:border-accent/50 hover:text-fg'
              }`}
            >
              {c !== 'all' && <CategoryIcon category={c} className="w-4 h-4" />}
              {c === 'all' ? labels.all : labels[c]}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="glass-card rounded-2xl p-6 text-muted">{labels.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((a, i) => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}`}
                className="group h-full flex flex-col bg-card border border-line rounded-2xl overflow-hidden shadow-soft hover:border-accent/50 hover:shadow-lg hover:shadow-glow/10 transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                  <ArticleCover cover={a.cover} category={a.category} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" priority={i < 3} />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
                    <CategoryIcon category={a.category} className="w-3.5 h-3.5" />{labels[a.category]}
                  </span>
                  <h2 className="font-heading font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors">{a.title}</h2>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">{a.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {labels.readMore}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
