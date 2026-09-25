// Server-side checks for product create/update payloads (admin API).
import { listCategories, getProduct, listProducts } from './db';
import { isFanCoil, isWithin, FAN_COILS_DUCTED_KEY } from './categories';
import { validateFanCoilSpecs } from './fanCoil';

/**
 * Returns the payload with cleaned fan coil specs / compatible ids, or a list
 * of Russian error messages. Partial updates (e.g. only image_url) pass as is.
 */
export async function validateProductPayload(
  payload: Record<string, unknown>,
  id?: string,
): Promise<{ payload: Record<string, unknown>; errors: string[] }> {
  const errors: string[] = [];
  const out = { ...payload };
  const cats = listCategories();

  if ('category' in payload) {
    if (!cats.some((c) => c.key === payload.category)) errors.push('Выберите существующую категорию.');
  }

  if ('category' in payload || 'specs' in payload) {
    const existing = id ? await getProduct(id) : null;
    const category = String(payload.category ?? existing?.category ?? '');
    if (isFanCoil(cats, category)) {
      const specs = ('specs' in payload ? payload.specs : existing?.specs) as Record<string, unknown> | null;
      const res = validateFanCoilSpecs(specs, isWithin(cats, category, FAN_COILS_DUCTED_KEY));
      errors.push(...res.errors);
      out.specs = Object.keys(res.specs).length ? res.specs : null;
    } else if (payload.specs && typeof payload.specs === 'object') {
      // Fan coil-only fields make no sense elsewhere (and would show on the card)
      const specs = { ...(payload.specs as Record<string, unknown>) };
      for (const k of ['pipe_system', 'fan_motor', 'esp_pa']) delete specs[k];
      out.specs = Object.keys(specs).length ? specs : null;
    }
  }

  if ('compatible_ids' in payload) {
    const ids = Array.isArray(payload.compatible_ids) ? payload.compatible_ids.map(String) : [];
    const known = new Set((await listProducts()).map((p) => p.id));
    out.compatible_ids = Array.from(new Set(ids.filter((x) => x !== id && known.has(x))));
  }

  return { payload: out, errors };
}
