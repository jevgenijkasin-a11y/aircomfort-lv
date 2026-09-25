// Fan coil parameters (stored in products.specs) — validation and catalog
// filter ranges. Pure, shared by the admin form, the API and the public site.
import type { SupabaseProduct } from './types';

export const PIPE_SYSTEMS = ['2', '4'] as const;
export const FAN_MOTORS = ['AC', 'DC'] as const;

/** Capacity buckets (kW) for the cooling/heating filters. */
export const KW_RANGES: { id: string; min: number; max: number; label: string }[] = [
  { id: 'lt3', min: 0, max: 3, label: '≤ 3 kW' },
  { id: '3-5', min: 3, max: 5, label: '3–5 kW' },
  { id: '5-8', min: 5, max: 8, label: '5–8 kW' },
  { id: '8-12', min: 8, max: 12, label: '8–12 kW' },
  { id: '12plus', min: 12, max: Infinity, label: '12+ kW' },
];

export const num = (v: unknown): number | null => {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(String(v).replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
};

export function inKwRange(value: unknown, id: string): boolean {
  const r = KW_RANGES.find((x) => x.id === id);
  const n = num(value);
  if (!r || n === null) return false;
  return r.id === 'lt3' ? n <= 3 : n > r.min && n <= r.max;
}

const specsOf = (p: Pick<SupabaseProduct, 'specs'>) => (p.specs && typeof p.specs === 'object' ? p.specs : {}) as Record<string, string>;
export const fanSpec = (p: Pick<SupabaseProduct, 'specs'>, k: string) => specsOf(p)[k] ?? '';

/**
 * Validates fan coil fields and returns the cleaned specs, or Russian error
 * messages. `ducted` enables the external static pressure field; for other
 * subcategories it is removed.
 */
export function validateFanCoilSpecs(
  specs: Record<string, unknown> | null | undefined,
  ducted: boolean,
): { specs: Record<string, string>; errors: string[] } {
  const s: Record<string, string> = {};
  for (const [k, v] of Object.entries(specs ?? {})) if (v !== null && v !== undefined && String(v).trim()) s[k] = String(v).trim();
  const errors: string[] = [];

  if (!PIPE_SYSTEMS.includes(s.pipe_system as never)) errors.push('Выберите систему труб: 2-трубный или 4-трубный.');
  if (!FAN_MOTORS.includes(s.fan_motor as never)) errors.push('Выберите двигатель вентилятора: AC или DC.');

  const positive = (k: string, label: string, required: boolean) => {
    if (!s[k]) { if (required) errors.push(`Укажите поле «${label}».`); return; }
    const n = num(s[k]);
    if (n === null || n <= 0) errors.push(`«${label}» должно быть положительным числом.`);
    else s[k] = String(n);
  };
  positive('cooling_kw', 'Мощность охлаждения, кВт', true);
  positive('heating_kw', 'Мощность нагрева, кВт', true);
  positive('airflow', 'Расход воздуха, м³/ч', false);
  positive('noise_db', 'Уровень шума, дБ(А)', false);
  if (ducted) positive('esp_pa', 'Внешний статический напор, Па', false);
  else delete s.esp_pa;

  return { specs: s, errors };
}
