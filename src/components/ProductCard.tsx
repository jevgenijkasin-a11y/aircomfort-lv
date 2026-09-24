// Single product card used everywhere (home "featured", catalog, landing
// pages, similar models, calculator suggestions). Works in both server and
// client trees. Images go through next/image — originals never reach the client.
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { type SupabaseProduct, productName, productImages } from '@/lib/types';
import { areaLabel, roomCount, asLoc } from '@/lib/productSeo';

const energyColors: Record<string, string> = {
  'A+++': 'text-[#27C4A0] border-[#27C4A0]/40 bg-[#27C4A0]/10',
  'A++': 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  'A+': 'text-[#86efac] border-[#86efac]/40 bg-[#86efac]/10',
};

const ROOMS = { lv: 'telpas', ru: 'комн.', en: 'rooms' };

/** Category icon for the no-photo placeholder (same icons as the category tiles). */
function CategoryIcon({ category }: { category: string }) {
  const d: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    heat_pump: 'M13 10V3L4 14h7v7l9-11h-7z',
    commercial: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    commercial_heat_pump: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  };
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#5B7A99]" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d[category] ?? d.home} />
    </svg>
  );
}

export default function ProductCard({ product, locale, installFrom }: { product: SupabaseProduct; locale: string; installFrom: number }) {
  const t = useTranslations('products');
  const l = asLoc(locale);
  const name = productName(product, locale);
  const image = productImages(product)[0];
  const area = areaLabel(product, l);
  const rooms = roomCount(product);
  const price = product.price
    ? product.discount_percent ? Math.round(product.price * (1 - product.discount_percent / 100)) : product.price
    : 0;

  return (
    <Link
      href={`/catalog/${product.id}` as any}
      className="glass-card product-card-hover rounded-2xl overflow-hidden flex flex-col group h-full p-3"
    >
      {/* Photo on a light plate — same height on every card */}
      <div className="relative h-48 rounded-xl overflow-hidden bg-[#F3F6F9]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
            quality={75}
            className="object-contain p-4"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <CategoryIcon category={product.category} />
            <span className="text-sm font-semibold text-[#3D5270]">{product.brand}</span>
          </div>
        )}
        <div className={`absolute top-2.5 right-2.5 text-xs font-bold px-2 py-0.5 rounded-lg border ${energyColors[product.energy_class] ?? 'text-[#3D5270] border-[#3D5270]/30 bg-white/70'}`}>
          {product.energy_class}
        </div>
        {(product.is_hit || product.is_promo || !!product.discount_percent) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_hit && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f97316] text-white">{t('badgeHit')}</span>}
            {product.is_promo && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e91e8c] text-white">{t('badgePromo')}</span>}
            {!!product.discount_percent && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eab308] text-black">-{product.discount_percent}%</span>}
          </div>
        )}
      </div>

      <div className="px-2 pt-4 pb-1 flex flex-col flex-1">
        <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="font-syne font-semibold text-sm text-white mb-2 leading-snug">{name}</h3>
        <p className="text-xs text-white/75 mb-4">
          {product.power_kw} kW
          {area ? ` · ${area} m²` : rooms ? ` · ${rooms} ${ROOMS[l]}` : ''}
        </p>

        <div className="mt-auto border-t border-white/10 pt-3 flex items-end justify-between gap-2">
          <div>
            {!price ? (
              <span className="font-syne font-semibold text-sm text-white/80">{t('priceOnRequest')}</span>
            ) : (
              <>
                {!!product.discount_percent && (
                  <span className="block text-xs text-white/60 line-through">{product.price.toLocaleString('lv-LV')} €</span>
                )}
                <span className={`font-syne font-bold text-xl ${product.discount_percent ? 'text-[#27C4A0]' : 'text-white'}`}>
                  {price.toLocaleString('lv-LV')} €
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-white/70 text-right">{t('installFrom', { price: installFrom })}</span>
        </div>
      </div>
    </Link>
  );
}
