// Brand strip on the home page: brands that have public in-stock products
// (from the DB, most models first), each linking to /catalog/brand/<brand>.
import { Link } from '@/i18n/navigation';
import { listProducts, hiddenCategoryKeys } from '@/lib/db';
import { visibleProducts } from '@/lib/catalogData';
import { brandSlug } from '@/lib/productSeo';

export default async function BrandMarquee() {
  const products = visibleProducts(await listProducts({ inStockOnly: true }), hiddenCategoryKeys());
  const counts = products.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.brand]: (acc[p.brand] ?? 0) + 1 }), {});
  const brands = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  if (!brands.length) return null;
  // 4 copies — translateX(-25%) loops seamlessly regardless of viewport width
  const quad = [...brands, ...brands, ...brands, ...brands];
  const linkCls = 'font-heading font-bold text-xl text-muted hover:text-primary transition-colors duration-200 tracking-wide';

  return (
    <section className="py-14 border-y border-line overflow-hidden">
      {/* prefers-reduced-motion: static list */}
      <div className="motion-reduce-show max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {brands.map((b) => (
            <li key={b}><Link href={`/catalog/brand/${brandSlug(b)}` as any} className={linkCls}>{b}</Link></li>
          ))}
        </ul>
      </div>

      {/* normal: marquee — the first copy is the real list, the repeats are hidden from assistive tech and the tab order */}
      <div className="motion-ok-show marquee-track group">
        <div className="marquee-inner group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {quad.map((b, i) => (
            <Link key={i} href={`/catalog/brand/${brandSlug(b)}` as any} className={`${linkCls} select-none px-10`}
              {...(i >= brands.length ? { 'aria-hidden': true, tabIndex: -1 } : {})}>
              {b}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .motion-reduce-show { display: none; }
          .motion-ok-show { display: block; }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce-show { display: block; }
          .motion-ok-show { display: none; }
        }

        .marquee-track {
          width: 100%;
          overflow: hidden;
        }

        .marquee-inner {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marquee-scroll 30s linear infinite;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }
        }
      `}</style>
    </section>
  );
}
