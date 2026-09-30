// Business card address /card/<slug>: validation + readable error messages.

export const CARD_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** null if fine (or not being changed), otherwise a Russian error message. */
export function cardSlugError(body: Record<string, unknown>, creating: boolean): string | null {
  if (!creating && !('slug' in body)) return null;
  const slug = String(body.slug ?? '').trim();
  if (!slug) return 'Укажите URL-ключ визитки (например, ivans-berzins).';
  if (!CARD_SLUG_RE.test(slug)) return 'URL-ключ: только латинские буквы в нижнем регистре, цифры и дефисы (например, ivans-berzins).';
  return null;
}

/** Friendly message for the UNIQUE constraint on slug. */
export const cardDbError = (e: unknown) =>
  /UNIQUE.*slug/i.test((e as Error)?.message ?? '')
    ? 'Такой URL-ключ уже занят другой визиткой — выберите другой.'
    : (e as Error)?.message ?? 'Ошибка сохранения';
