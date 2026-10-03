// Public product data for the favourites and comparison pages (their lists
// live in the visitor's localStorage). Only public, in-stock products are
// returned, in the requested order.
//   GET /api/products?ids=a,b,c&locale=lv            → { cards }
//   GET /api/products?ids=a,b&locale=lv&compare=1     → { cards, specs }
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProduct, hiddenCategoryKeys } from '@/lib/db';
import { DUPLICATE_REDIRECTS } from '@/lib/catalogData';
import { toCard } from '@/lib/productCard';
import { areaLabel, asLoc, roomCount } from '@/lib/productSeo';
import type { SupabaseProduct } from '@/lib/types';

const num = /^\s*\d+(?:[.,]\d+)?\s*$/;
const withUnit = (v: string | undefined, unit: string) => (!v ? '' : num.test(v) ? `${v.trim()} ${unit}` : v.trim());

/** "-15  +45", "-20 / +50" → "−15 °C"; anything else is shown as written. */
function minTemp(v: string | undefined): string {
  if (!v) return '';
  const m = v.match(/-\s*\d+(?:[.,]\d+)?/);
  return m ? `${m[0].replace(/\s/g, '').replace('-', '−')} °C` : v.trim();
}

function specsOf(p: SupabaseProduct, locale: string) {
  const s = (p.specs ?? {}) as Record<string, string>;
  const l = asLoc(locale);
  const kw = l === 'ru' ? 'кВт' : 'kW';
  const area = areaLabel(p, l);
  const rooms = roomCount(p);
  return {
    cooling: withUnit(s.cooling_kw, kw) || (p.power_kw > 0 ? `${p.power_kw} ${kw}` : ''),
    heating: withUnit(s.heating_kw, kw),
    area: area ? `${area} ${l === 'ru' ? 'м²' : 'm²'}` : rooms ? String(rooms) : '',
    energy: p.energy_class || '',
    noise: withUnit(s.noise_db, 'dB(A)'),
    seer: s.seer?.trim() || '',
    scop: s.scop?.trim() || '',
    minTemp: minTemp(s.operating_temp),
    refrigerant: s.refrigerant?.trim() || '',
    wifi: s.wifi === 'yes',
    indoor: s.indoor_dims?.trim() || '',
    outdoor: s.outdoor_dims?.trim() || '',
  };
}
export type CompareSpecs = ReturnType<typeof specsOf>;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const locale = ['lv', 'ru', 'en'].includes(sp.get('locale') ?? '') ? sp.get('locale')! : 'lv';
  const ids = Array.from(new Set((sp.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean))).slice(0, 100);
  const hidden = hiddenCategoryKeys();
  const products: SupabaseProduct[] = [];
  for (const id of ids) {
    const p = await getProduct(id);
    if (p && p.in_stock && !hidden.has(p.category) && !DUPLICATE_REDIRECTS[p.id]) products.push(p);
  }
  const cards = products.map((p) => toCard(p, locale));
  const body = sp.get('compare') ? { cards, specs: products.map((p) => specsOf(p, locale)) } : { cards };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
