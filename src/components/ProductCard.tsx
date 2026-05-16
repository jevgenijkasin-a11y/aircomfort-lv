import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Product } from '@/data/products';

interface Props {
  product: Product;
}

const energyColors: Record<string, string> = {
  'A+++': 'text-[#27C4A0] border-[#27C4A0]/30 bg-[#27C4A0]/10',
  'A++': 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  'A+': 'text-[#86efac] border-[#86efac]/30 bg-[#86efac]/10',
};

export default function ProductCard({ product }: Props) {
  const t = useTranslations('products');

  const energyCls = energyColors[product.energyClass] ?? 'text-white/50 border-white/20 bg-white/5';

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group">
      {/* Image area */}
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${product.brandColor}18, ${product.brandColor}08)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 60% 40%, ${product.brandColor}, transparent 70%)` }}
        />
        {/* Brand initial with snowflake */}
        <div className="relative flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-14 h-14 opacity-30" fill="none" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span
            className="text-2xl font-syne font-bold opacity-70"
            style={{ color: product.brandColor === '#072D47' ? '#fff' : product.brandColor }}
          >
            {product.brand}
          </span>
        </div>
        {/* Energy class badge */}
        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-lg border ${energyCls}`}>
          {product.energyClass}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-auto">
          <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="font-syne font-semibold text-base text-white mb-3 leading-tight">
            {product.model}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <svg className="w-3.5 h-3.5 text-[#1A6B9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{t('power')}: <strong className="text-white/70">{product.powerKw} kW</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <svg className="w-3.5 h-3.5 text-[#1A6B9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{product.areaCoverage} m²</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {product.features.map((f) => (
              <span
                key={f}
                className="text-xs text-white/40 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-[#1A6B9A]/15 pt-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-white/35 mb-0.5">{t('from')}</p>
              <p className="font-syne font-bold text-2xl text-white">
                {product.price.toLocaleString('lv-LV')} €
              </p>
            </div>
            <p className="text-xs text-white/35 text-right">{t('installFrom', { price: 250 })}</p>
          </div>
          <Link
            href="/contacts"
            className="w-full flex items-center justify-center bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#27C4A0]/15 group-hover:shadow-[#27C4A0]/25"
          >
            {t('order')}
          </Link>
        </div>
      </div>
    </div>
  );
}
