'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { SupabaseProduct } from '@/lib/types';
import { recommendedPowerKw, matchingPowerRange } from '@/lib/calc';
import { ProductGrid } from '@/components/CatalogClient';
import { starred } from '@/components/FootnoteStar';

interface CalcResult {
  powerKw: number;
  equipMin: number;
  equipMax: number;
  installMin: number;
  installMax: number;
  models: SupabaseProduct[];
}

const finalPrice = (p: SupabaseProduct) =>
  p.discount_percent ? Math.round(p.price * (1 - p.discount_percent / 100)) : p.price;

/** Models whose capacity fits the recommended size, cheapest first. Falls back to the next larger capacity available. */
function matchingModels(powerKw: number, products: SupabaseProduct[]): SupabaseProduct[] {
  const { min, max } = matchingPowerRange(powerKw);
  let list = products.filter((p) => p.power_kw >= min && p.power_kw <= max);
  if (!list.length) {
    const bigger = products.filter((p) => p.power_kw >= min);
    const nearest = bigger.length ? Math.min(...bigger.map((p) => p.power_kw)) : null;
    list = nearest !== null ? bigger.filter((p) => p.power_kw <= nearest + 0.5) : [];
  }
  return list.sort((a, b) => finalPrice(a) - finalPrice(b));
}

const SUITABLE = { lv: 'Piemēroti modeļi', ru: 'Подходящие модели', en: 'Suitable models' };

export default function Calculator({ installFrom = 250, installTo = 350, products = [], locale = 'lv' }: { installFrom?: number; installTo?: number; products?: SupabaseProduct[]; locale?: string }) {
  const t = useTranslations('calculator');
  const tp = useTranslations('products');
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);
  const L = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';

  const [area, setArea] = useState('');
  const [roomType, setRoomType] = useState('living');
  const [insulation, setInsulation] = useState('avg');
  const [windows, setWindows] = useState('2');
  const [floor, setFloor] = useState('middle');
  const [result, setResult] = useState<CalcResult | null>(null);

  const handleCalc = () => {
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) return;
    const powerKw = recommendedPowerKw({ area: areaNum, roomType, insulation, windows: parseInt(windows) || 0, floor });
    const models = matchingModels(powerKw, products);
    const prices = models.map(finalPrice);
    setResult({
      powerKw,
      equipMin: prices.length ? Math.min(...prices) : 0,
      equipMax: prices.length ? Math.max(...prices) : 0,
      installMin: installFrom,
      installMax: installTo,
      models,
    });
  };

  // After each calculation, bring the result into view (mostly matters on mobile,
  // where the result card sits below the form).
  useEffect(() => {
    if (!result || !resultRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [result]);

  const handleGetOffer = () => {
    if (!result) return;
    const roomLabels: Record<string, string> = { bedroom: t('bedroom'), living: t('living'), office: t('office'), kitchen: t('kitchen') };
    const insulationLabels: Record<string, string> = { good: t('goodInsulation'), avg: t('avgInsulation'), poor: t('poorInsulation') };
    const message = [
      `${t('area')}: ${area} m²`,
      `${t('roomType')}: ${roomLabels[roomType] ?? roomType}`,
      `${t('insulation')}: ${insulationLabels[insulation] ?? insulation}`,
      `${t('recommendedPower')}: ${result.powerKw} ${t('kw')}`,
      `${t('equipmentCost')}: ${t('from')} ${result.equipMin} €`,
      `${t('installationCost')}: ${t('from')} ${result.installMin} €`,
      `${t('totalCost')}: ${t('from')} ${result.equipMin + result.installMin} €`,
    ].join('\n');
    router.push(`/contacts?service=consultation&message=${encodeURIComponent(message)}`);
  };

  const labelCls = 'block text-sm font-medium text-muted mb-1.5';
  const inputCls =
    'w-full bg-surface border border-line text-fg text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-accent/50 transition-colors placeholder-muted';
  const selectCls =
    'w-full bg-surface border border-line text-fg text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="glass-card rounded-2xl p-7">
          <h2 className="font-heading font-semibold text-lg mb-6 text-primary">{t('step1')}</h2>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>{t('area')}</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={t('areaPlaceholder')}
                min="1"
                max="500"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('roomType')}</label>
              <div className="relative">
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className={selectCls}
                >
                  <option value="bedroom" style={{ background: 'rgb(var(--card))' }}>{t('bedroom')}</option>
                  <option value="living" style={{ background: 'rgb(var(--card))' }}>{t('living')}</option>
                  <option value="office" style={{ background: 'rgb(var(--card))' }}>{t('office')}</option>
                  <option value="kitchen" style={{ background: 'rgb(var(--card))' }}>{t('kitchen')}</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/70 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="font-heading font-semibold text-lg mt-8 mb-6 text-primary">{t('step2')}</h2>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>{t('insulation')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'good', label: t('goodInsulation') },
                  { val: 'avg', label: t('avgInsulation') },
                  { val: 'poor', label: t('poorInsulation') },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setInsulation(val)}
                    className={`py-2.5 px-2 text-xs font-medium rounded-xl border transition-all ${
                      insulation === val
                        ? 'bg-accent/15 border-accent/50 text-primary'
                        : 'bg-surface border-line text-muted hover:text-fg hover:border-line'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('windows')}</label>
              <input
                type="number"
                value={windows}
                onChange={(e) => setWindows(e.target.value)}
                min="0"
                max="20"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('floor')}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'top', label: t('topFloor') },
                  { val: 'middle', label: t('middleFloor') },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setFloor(val)}
                    className={`py-2.5 px-3 text-xs font-medium rounded-xl border transition-all ${
                      floor === val
                        ? 'bg-accent/15 border-accent/50 text-primary'
                        : 'bg-surface border-line text-muted hover:text-fg hover:border-line'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleCalc}
            disabled={!area}
            className="mt-8 w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-on-primary font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-glow/20 hover:shadow-glow/30 text-base"
          >
            {t('calculate')}
          </button>
        </div>

        {/* Result */}
        <div ref={resultRef} className="scroll-mt-28">
          {result ? (
            <div className="glass-card rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-lg">{t('resultTitle')}</h3>
              </div>

              {/* Recommended power */}
              <div className="bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 rounded-xl p-5 mb-5">
                <p className="text-muted text-sm mb-1">{t('recommendedPower')}</p>
                <p className="font-heading font-bold text-4xl text-primary">{result.powerKw} {t('kw')}</p>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-3 border-b border-line">
                  <span className="text-muted text-sm">{t('equipmentCost')}</span>
                  <span className="font-semibold text-fg">
                    {result.equipMin > 0
                      ? `${t('from')} ${result.equipMin.toLocaleString('lv-LV')} €`
                      : t('priceOnRequest')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-line">
                  <span className="text-muted text-sm">{t('installationCost')}</span>
                  <span className="font-semibold text-fg">
                    {starred(`${t('from')} ${result.installMin} €*`)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-heading font-semibold">{t('totalCost')}</span>
                  <span className="font-heading font-bold text-xl text-primary">
                    {result.equipMin > 0
                      ? `${t('from')} ${(result.equipMin + result.installMin).toLocaleString('lv-LV')} €`
                      : t('priceOnRequest')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGetOffer}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-on-primary font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-glow/20 text-base"
              >
                {t('getOffer')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </button>

              <p className="text-muted text-xs mt-4 leading-relaxed">{starred(tp('installNote'))}</p>
              {/* The '*' belongs to the installation note above; the general disclaimer gets none */}
              <p className="text-muted text-xs mt-1 leading-relaxed">{t('disclaimer').replace(/^\*\s*/, '')}</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-16 h-16 rounded-2xl bg-cool/15 border border-line flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </div>
              <p className="font-heading font-semibold text-muted mb-1">{t('resultTitle')}</p>
              <p className="text-sm text-muted">{t('areaPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Suitable catalogue models (3–6), cheapest first */}
      {result && result.models.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading font-semibold text-xl mb-6">{SUITABLE[L]} — {result.powerKw} {t('kw')}</h2>
          <ProductGrid products={result.models.slice(0, 6)} locale={locale} installFrom={installFrom} />
        </section>
      )}
    </div>
  );
}
