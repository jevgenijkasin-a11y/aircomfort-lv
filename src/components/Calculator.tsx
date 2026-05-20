'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface ProductPrice {
  power_kw: number;
  price: number;
  discount_percent: number | null;
}

interface CalcResult {
  powerKw: number;
  equipMin: number;
  equipMax: number;
  installMin: number;
  installMax: number;
}

function recommendedPower(area: number, roomType: string, insulation: string, windows: number, floor: string): number {
  const baseFactors: Record<string, number> = { good: 30, avg: 40, poor: 50 };
  const roomExtra: Record<string, number> = { bedroom: 0, living: 200, office: 300, kitchen: 500 };
  let watts = area * (baseFactors[insulation] ?? 40);
  watts += (roomExtra[roomType] ?? 0);
  watts += windows * 100;
  if (floor === 'top') watts *= 1.15;
  return Math.ceil((watts / 1000) * 2) / 2;
}

function getPriceRange(powerKw: number, products: ProductPrice[]): { min: number; max: number } {
  const finalPrice = (p: ProductPrice) =>
    p.discount_percent ? Math.round(p.price * (1 - p.discount_percent / 100)) : p.price;

  // Products that can handle the required power (power_kw >= recommended)
  const suitable = products.filter(p => p.power_kw >= powerKw);

  // If no exact-or-above match, take all products (edge case: only low-power in catalog)
  const pool = suitable.length > 0 ? suitable : products;
  if (pool.length === 0) return { min: 0, max: 0 };

  // Use only the minimum matching power level to avoid mixing classes
  const minPower = Math.min(...pool.map(p => p.power_kw));
  const atMinPower = pool.filter(p => p.power_kw === minPower);

  const prices = atMinPower.map(finalPrice).sort((a, b) => a - b);
  return { min: prices[0], max: prices[prices.length - 1] };
}

export default function Calculator({ installFrom = 250, installTo = 350, products = [] }: { installFrom?: number; installTo?: number; products?: ProductPrice[] }) {
  const t = useTranslations('calculator');
  const router = useRouter();

  const [area, setArea] = useState('');
  const [roomType, setRoomType] = useState('living');
  const [insulation, setInsulation] = useState('avg');
  const [windows, setWindows] = useState('2');
  const [floor, setFloor] = useState('middle');
  const [result, setResult] = useState<CalcResult | null>(null);

  const handleCalc = () => {
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) return;
    const powerKw = recommendedPower(areaNum, roomType, insulation, parseInt(windows) || 0, floor);
    const { min: equipMin, max: equipMax } = getPriceRange(powerKw, products);
    setResult({ powerKw, equipMin, equipMax, installMin: installFrom, installMax: installTo });
  };

  const handleGetOffer = () => {
    if (!result) return;
    const roomLabels: Record<string, string> = { bedroom: t('bedroom'), living: t('living'), office: t('office'), kitchen: t('kitchen') };
    const insulationLabels: Record<string, string> = { good: t('goodInsulation'), avg: t('avgInsulation'), poor: t('poorInsulation') };
    const message = [
      `${t('area')}: ${area} m²`,
      `${t('roomType')}: ${roomLabels[roomType] ?? roomType}`,
      `${t('insulation')}: ${insulationLabels[insulation] ?? insulation}`,
      `${t('recommendedPower')}: ${result.powerKw} ${t('kw')}`,
      `${t('equipmentCost')}: ${result.equipMin}–${result.equipMax} €`,
      `${t('installationCost')}: ${result.installMin}–${result.installMax} €`,
      `${t('totalCost')}: ${t('from')} ${result.equipMin + result.installMin} €`,
    ].join('\n');
    router.push(`/contacts?service=consultation&message=${encodeURIComponent(message)}`);
  };

  const labelCls = 'block text-sm font-medium text-white/60 mb-1.5';
  const inputCls =
    'w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/20';
  const selectCls =
    'w-full bg-[#0A3658]/80 border border-[#1A6B9A]/30 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors appearance-none cursor-pointer';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="glass-card rounded-2xl p-7">
          <h2 className="font-syne font-semibold text-lg mb-6 text-[#27C4A0]">{t('step1')}</h2>

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
                  <option value="bedroom" style={{ background: '#0A3658' }}>{t('bedroom')}</option>
                  <option value="living" style={{ background: '#0A3658' }}>{t('living')}</option>
                  <option value="office" style={{ background: '#0A3658' }}>{t('office')}</option>
                  <option value="kitchen" style={{ background: '#0A3658' }}>{t('kitchen')}</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="font-syne font-semibold text-lg mt-8 mb-6 text-[#27C4A0]">{t('step2')}</h2>

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
                        ? 'bg-[#27C4A0]/15 border-[#27C4A0]/50 text-[#27C4A0]'
                        : 'bg-[#0A3658]/50 border-[#1A6B9A]/25 text-white/50 hover:text-white hover:border-[#1A6B9A]/50'
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
                        ? 'bg-[#27C4A0]/15 border-[#27C4A0]/50 text-[#27C4A0]'
                        : 'bg-[#0A3658]/50 border-[#1A6B9A]/25 text-white/50 hover:text-white hover:border-[#1A6B9A]/50'
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
            className="mt-8 w-full bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-40 disabled:cursor-not-allowed text-[#072D47] font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#27C4A0]/20 hover:shadow-[#27C4A0]/30 text-base"
          >
            {t('calculate')}
          </button>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="glass-card rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-[#27C4A0]/15 border border-[#27C4A0]/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#27C4A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-syne font-semibold text-lg">{t('resultTitle')}</h3>
              </div>

              {/* Recommended power */}
              <div className="bg-gradient-to-r from-[#27C4A0]/10 to-transparent border border-[#27C4A0]/20 rounded-xl p-5 mb-5">
                <p className="text-white/50 text-sm mb-1">{t('recommendedPower')}</p>
                <p className="font-syne font-bold text-4xl text-[#27C4A0]">{result.powerKw} {t('kw')}</p>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-3 border-b border-[#1A6B9A]/15">
                  <span className="text-white/55 text-sm">{t('equipmentCost')}</span>
                  <span className="font-semibold text-white">
                    {result.equipMin > 0
                      ? result.equipMin === result.equipMax
                        ? `${result.equipMin.toLocaleString('lv-LV')} €`
                        : `${t('from')} ${result.equipMin.toLocaleString('lv-LV')}–${result.equipMax.toLocaleString('lv-LV')} €`
                      : t('priceOnRequest')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#1A6B9A]/15">
                  <span className="text-white/55 text-sm">{t('installationCost')}</span>
                  <span className="font-semibold text-white">
                    {result.installMin}–{result.installMax} €
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-syne font-semibold">{t('totalCost')}</span>
                  <span className="font-syne font-bold text-xl text-[#27C4A0]">
                    {result.equipMin > 0
                      ? `${t('from')} ${(result.equipMin + result.installMin).toLocaleString('lv-LV')} €`
                      : t('priceOnRequest')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGetOffer}
                className="w-full flex items-center justify-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#27C4A0]/20 text-base"
              >
                {t('getOffer')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </button>

              <p className="text-white/25 text-xs mt-4 leading-relaxed">{t('disclaimer')}</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-16 h-16 rounded-2xl bg-[#1A6B9A]/15 border border-[#1A6B9A]/25 flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1A6B9A]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </div>
              <p className="font-syne font-semibold text-white/50 mb-1">{t('resultTitle')}</p>
              <p className="text-sm text-white/25">{t('areaPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
