'use client';

// Comparison table for the products in localStorage. Phones: the table
// scrolls sideways, the first column (labels) stays put.
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CardProduct } from '@/lib/productCard';
import { useCompare, removeCompare, clearCompare } from '@/lib/shortlist';
import { OrderButton } from '@/components/ProductCardActions';
import { finalCardPrice } from '@/lib/productCard';

type Specs = {
  cooling: string; heating: string; area: string; energy: string; noise: string; seer: string; scop: string;
  minTemp: string; refrigerant: string; wifi: boolean; indoor: string; outdoor: string;
};
type Data = { cards: CardProduct[]; specs: Specs[] };

const ROWS: { key: keyof Specs | 'price'; label: string }[] = [
  { key: 'price', label: 'rowPrice' }, { key: 'cooling', label: 'rowCooling' }, { key: 'heating', label: 'rowHeating' },
  { key: 'area', label: 'rowArea' }, { key: 'energy', label: 'rowClass' }, { key: 'noise', label: 'rowNoise' },
  { key: 'seer', label: 'rowSeer' }, { key: 'scop', label: 'rowScop' }, { key: 'minTemp', label: 'rowMinTemp' },
  { key: 'refrigerant', label: 'rowRefrigerant' }, { key: 'wifi', label: 'rowWifi' },
  { key: 'indoor', label: 'rowIndoor' }, { key: 'outdoor', label: 'rowOutdoor' },
];

const stickyCol = 'sticky left-0 z-10 bg-card';

export default function CompareView({ locale }: { locale: string }) {
  const t = useTranslations('shop');
  const items = useCompare();
  const [data, setData] = useState<Data | null>(null);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const key = items.map((i) => i.id).join(',');
  useEffect(() => {
    if (!hydrated) return;
    if (!key) { setData({ cards: [], specs: [] }); return; }
    let alive = true;
    fetch(`/api/products?ids=${encodeURIComponent(key)}&locale=${locale}&compare=1`)
      .then((r) => r.json())
      .then((d: Data) => { if (alive) setData(d); })
      .catch(() => alive && setData({ cards: [], specs: [] }));
    return () => { alive = false; };
  }, [key, locale, hydrated]);

  if (!data) return <div className="glass-card rounded-2xl h-96 animate-pulse" aria-busy="true" />;

  // Products still in the list (removals show at once)
  const cols = data.cards.map((c, i) => ({ card: c, specs: data.specs[i] })).filter((x) => items.some((it) => it.id === x.card.id));

  if (!cols.length) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-muted mb-5">{t('cmpEmpty')}</p>
        <Link href="/catalog" className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors">{t('toCatalog')}</Link>
      </div>
    );
  }

  const value = (col: (typeof cols)[number], k: (typeof ROWS)[number]['key']): string => {
    if (k === 'price') { const p = finalCardPrice(col.card); return p ? `${p.toLocaleString('lv-LV')} €` : t('priceOnRequest'); }
    if (k === 'wifi') return col.specs.wifi ? t('yes') : '';
    return col.specs[k] as string;
  };
  const rows = ROWS.filter((r) => !onlyDiff || new Set(cols.map((c) => value(c, r.key) || '—')).size > 1);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <label className="inline-flex items-center gap-3 min-h-[44px] cursor-pointer select-none">
          <span className="relative inline-flex">
            <input type="checkbox" role="switch" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="peer sr-only" />
            <span className="w-11 h-6 rounded-full bg-line-strong peer-checked:bg-primary transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
            <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
          <span className="font-semibold">{t('onlyDiff')}</span>
        </label>
        <button type="button" onClick={clearCompare} className="min-h-[44px] px-4 rounded-xl border border-line text-sm font-semibold text-muted hover:text-fg hover:border-line-strong transition-colors">{t('clear')}</button>
      </div>
      {cols.length === 1 && <p className="mb-4 text-sm text-muted">{t('cmpOne')}</p>}

      <div className="glass-card rounded-2xl overflow-x-auto overscroll-x-contain">
        {/* Equal product columns; on phones the table is wider than the screen and scrolls */}
        <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: `calc(7rem + ${cols.length} * 9.5rem)` }}>
          <caption className="sr-only">{t('cmpTitle')}</caption>
          <colgroup>
            <col className="w-28 md:w-56" />
            {cols.map(({ card }) => <col key={card.id} />)}
          </colgroup>
          <thead>
            <tr>
              <td className={`${stickyCol} border-b border-line`} />
              {cols.map(({ card }) => (
                <th key={card.id} scope="col" className="align-top text-left font-normal p-2.5 md:p-4 border-b border-l border-line">
                  <div className="relative">
                    <button type="button" onClick={() => removeCompare(card.id)} aria-label={`${t('cmpRemove')}: ${card.name}`} title={t('cmpRemove')}
                      className="absolute -top-1 -right-1 z-10 w-11 h-11 flex items-center justify-center rounded-full text-muted hover:text-heat">
                      <span className="w-7 h-7 rounded-full bg-card border border-line flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </span>
                    </button>
                    <div data-theme="light" className="relative aspect-square max-h-48 mx-auto rounded-xl bg-photo overflow-hidden mb-2.5">
                      {card.image && <Image src={card.image} alt={card.name} fill sizes="(max-width: 767px) 150px, 200px" className="object-contain p-3 mix-blend-multiply" />}
                    </div>
                    <p className="text-primary text-[11px] font-semibold uppercase tracking-wider">{card.brand}</p>
                    <Link href={`/catalog/${card.id}` as '/catalog'} className="font-heading font-semibold leading-snug line-clamp-3 hover:text-primary transition-colors">{card.name}</Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="odd:bg-surface/60">
                <th scope="row" className={`${stickyCol} text-left font-medium text-muted p-2.5 md:p-4 border-b border-line leading-snug`}>{t(r.label)}</th>
                {cols.map((c) => {
                  const v = value(c, r.key);
                  return (
                    <td key={c.card.id} className={`p-2.5 md:p-4 border-b border-l border-line align-top ${r.key === 'price' ? 'font-heading font-bold text-base md:text-lg' : ''}`}>
                      {v || <span className="text-muted">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className={`${stickyCol} p-2.5 md:p-4`} />
              {cols.map(({ card }) => (
                <td key={card.id} className="p-2.5 md:p-4 border-l border-line"><OrderButton product={card} /></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
