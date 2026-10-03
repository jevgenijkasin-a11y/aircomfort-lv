// Single product card used everywhere (home "featured", catalog, landing
// pages, similar models, calculator suggestions). Works in both server and
// client trees. Takes the slim CardProduct (lib/productCard), never the full
// product. Images go through next/image — originals never reach the client.
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CardProduct } from '@/lib/productCard';
import { starred } from '@/components/FootnoteStar';
import { CardToggles, OrderButton } from '@/components/ProductCardActions';
import { finalCardPrice } from '@/lib/productCard';

const energyColors: Record<string, string> = {
  'A+++': 'text-primary border-accent/40 bg-accent/10',
  'A++': 'text-energy-fg border-energy-fg/30 bg-energy-bg',
  'A+': 'text-energy-fg border-energy-fg/30 bg-energy-bg',
};

/** "2 комнаты" / "5 комнат", "2 telpas", "2 rooms" — multi-split room count, no m². */
function roomsLabel(n: number, l: 'lv' | 'ru' | 'en'): string {
  if (l === 'ru') {
    const m10 = n % 10, m100 = n % 100;
    const w = m10 === 1 && m100 !== 11 ? 'комната' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'комнаты' : 'комнат';
    return `${n} ${w}`;
  }
  if (l === 'en') return `${n} ${n === 1 ? 'room' : 'rooms'}`;
  return `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'telpa' : 'telpas'}`;
}

/** Category icon for the no-photo placeholder (same icons as the category tiles). */
function CategoryIcon({ category }: { category: string }) {
  const d: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    heat_pump: 'M13 10V3L4 14h7v7l9-11h-7z',
    commercial: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    commercial_heat_pump: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
    fan_coils: 'M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M12 10c0-4 3-6 5-4s-1 5-5 4m2 2c4 0 6 3 4 5s-5-1-4-5m-2 2c0 4-3 6-5 4s1-5 5-4m-2-2c-4 0-6-3-4-5s5 1 4 5',
  };
  const key = category.startsWith('fan_coils') ? 'fan_coils' : category;
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 text-muted" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d[key] ?? d.home} />
    </svg>
  );
}

export default function ProductCard({ product, locale, installFrom }: { product: CardProduct; locale: string; installFrom: number }) {
  const t = useTranslations('products');
  const tc = useTranslations('catalog');
  const l = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';
  // Fan coil parameters (pipes / motor) are only set for fan coils
  const ts = useTranslations('shop');
  const { name, image, rooms, pipes, motor, areaMax } = product;
  const price = finalCardPrice(product);
  // "2,7 kW" in LV/RU, "2.7 kW" in EN
  const kw = `${product.power_kw.toLocaleString(l === 'en' ? 'en-GB' : l === 'ru' ? 'ru-RU' : 'lv-LV')} ${l === 'ru' ? 'кВт' : 'kW'}`;
  const chips = [
    product.power_kw > 0 ? kw : '',
    areaMax ? ts('upTo', { n: areaMax }) : rooms ? roomsLabel(rooms, l) : '',
    pipes ? tc(`pipes${pipes}`) : '',
    motor,
  ].filter(Boolean);

  return (
    // The title link is stretched over the whole card (after:inset-0); the
    // favourite / compare / order buttons sit above it (z-10).
    <article className="product-card">
      {/* Photo on a light plate in both themes (data-theme="light" keeps the
          badges on it in the light palette). Square inside a phone grid (globals.css) */}
      <div data-theme="light" className="pc-photo">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 767px) 46vw, (max-width: 1024px) 45vw, 300px"
            quality={75}
            className="pc-img"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <CategoryIcon category={product.category} />
            <span className="text-sm font-semibold text-muted">{product.brand}</span>
          </div>
        )}
        {product.energy_class && (
          <div className={`pc-energy ${energyColors[product.energy_class] ?? 'text-muted border-line-strong bg-card/70'}`}>
            {product.energy_class}
          </div>
        )}
        {(product.is_hit || product.is_promo || !!product.discount_percent) && (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {product.is_hit && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-hit text-white">{t('badgeHit')}</span>}
            {product.is_promo && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-promo text-white">{t('badgePromo')}</span>}
            {!!product.discount_percent && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sale text-black">-{product.discount_percent}%</span>}
          </div>
        )}
        <CardToggles id={product.id} category={product.category} name={name} image={image} />
      </div>

      <div className="pc-body">
        <p className="pc-brand">{product.brand}</p>
        <h3 className="pc-title">
          <Link href={`/catalog/${product.id}` as any}
            className="pc-link">
            {name}
          </Link>
        </h3>
        {chips.length > 0 && (
          <ul className="pc-chips">
            {chips.map((c) => (
              <li key={c} className="pc-chip">{c}</li>
            ))}
          </ul>
        )}

        <div className="pc-foot">
          <div className="min-w-0">
            {!price ? (
              <span className="font-heading font-semibold text-sm text-fg">{t('priceOnRequest')}</span>
            ) : (
              <>
                {!!product.discount_percent && (
                  <span className="block text-xs text-muted line-through">{product.price.toLocaleString('lv-LV')} €</span>
                )}
                <span className={product.discount_percent ? 'pc-price !text-primary' : 'pc-price'}>
                  {price.toLocaleString('lv-LV')} €
                </span>
              </>
            )}
          </div>
          {/* Installation price: not on the compact phone card */}
          <span className="pc-inst">{starred(t('installFrom', { price: installFrom }))}</span>
        </div>
        <OrderButton product={{ id: product.id, name, price: product.price, discount_percent: product.discount_percent, image }} className="mt-2.5 md:mt-3" />
      </div>
    </article>
  );
}
