// Air-conditioner sizing used by the calculator. Pure functions — see calc.test.ts.

/** Base cooling load per m² for a typical room with ceilings up to ~2.7 m. */
export const BASE_W_PER_M2 = 100;

/** Building envelope: good = new build / insulated, poor = old building. */
export const INSULATION_FACTOR: Record<string, number> = { good: 0.9, avg: 1.0, poor: 1.2 };

/** Top floor gets extra heat through the roof. */
export const TOP_FLOOR_FACTOR = 1.1;

/** Internal heat gains by room type (cooking, office equipment). */
export const ROOM_FACTOR: Record<string, number> = { bedroom: 1.0, living: 1.0, office: 1.1, kitchen: 1.15 };

/** Solar gain per window beyond the first one. */
export const W_PER_EXTRA_WINDOW = 150;

/** Standard residential unit sizes, kW — the result is rounded UP to one of these. */
export const STANDARD_SIZES_KW = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1];

export type CalcInput = { area: number; roomType: string; insulation: string; windows: number; floor: string };

/** Required cooling capacity in watts, before rounding to a unit size. */
export function requiredWatts({ area, roomType, insulation, windows, floor }: CalcInput): number {
  let w = area * BASE_W_PER_M2;
  w *= INSULATION_FACTOR[insulation] ?? 1.0;
  w *= ROOM_FACTOR[roomType] ?? 1.0;
  if (floor === 'top') w *= TOP_FLOOR_FACTOR;
  w += Math.max(0, windows - 1) * W_PER_EXTRA_WINDOW;
  return w;
}

/** Round up to the nearest standard size; above the largest one, round up to 0.5 kW. */
export function roundToStandardSize(kw: number): number {
  const size = STANDARD_SIZES_KW.find((s) => s >= kw - 1e-9);
  return size ?? Math.ceil(kw * 2) / 2;
}

export function recommendedPowerKw(input: CalcInput): number {
  return roundToStandardSize(requiredWatts(input) / 1000);
}

/** Catalogue models suitable for a recommended size: from that size up to the next one. */
export function matchingPowerRange(kw: number): { min: number; max: number } {
  const i = STANDARD_SIZES_KW.indexOf(kw);
  const next = i >= 0 && i < STANDARD_SIZES_KW.length - 1 ? STANDARD_SIZES_KW[i + 1] : kw + 1;
  return { min: kw, max: next - 0.01 };
}
