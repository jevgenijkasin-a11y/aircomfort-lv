// Models for the room calculator: residential air-to-air units (home ACs and
// air-to-air heat pumps, in stock, with a price) that fit the recommended
// capacity. The calculator page no longer embeds the product base in its HTML.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listProducts, hiddenCategoryKeys } from '@/lib/db';
import { visibleProducts } from '@/lib/catalogData';
import { matchingPowerRange } from '@/lib/calc';
import { toCards } from '@/lib/productCard';
import type { SupabaseProduct } from '@/lib/types';

const finalPrice = (p: SupabaseProduct) => (p.discount_percent ? Math.round(p.price * (1 - p.discount_percent / 100)) : p.price);

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

export async function GET(req: NextRequest) {
  const kw = Number(req.nextUrl.searchParams.get('kw'));
  const locale = req.nextUrl.searchParams.get('locale') || 'lv';
  if (!Number.isFinite(kw) || kw <= 0 || kw > 100) return NextResponse.json({ error: 'kw' }, { status: 400 });
  const residential = visibleProducts(await listProducts({ inStockOnly: true }), hiddenCategoryKeys()).filter(
    (p) => p.price > 0 && (p.category === 'home' || p.category === 'heat_pump')
  );
  const models = matchingModels(kw, residential);
  const prices = models.map(finalPrice);
  return NextResponse.json(
    {
      equipMin: prices.length ? Math.min(...prices) : 0,
      equipMax: prices.length ? Math.max(...prices) : 0,
      models: toCards(models.slice(0, 6), ['lv', 'ru', 'en'].includes(locale) ? locale : 'lv'),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
