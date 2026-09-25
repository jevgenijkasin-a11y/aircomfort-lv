// Validation for category create/update (admin API). Errors are in Russian.
import { type Category, SLUG_RE, slugify } from './categories';

const TEXT_FIELDS = [
  'name_lv', 'name_ru', 'name_en', 'image_url',
  'seo_title_lv', 'seo_title_ru', 'seo_title_en', 'seo_description_lv', 'seo_description_ru', 'seo_description_en',
  'seo_h1_lv', 'seo_h1_ru', 'seo_h1_en', 'seo_intro_lv', 'seo_intro_ru', 'seo_intro_en',
] as const;

export function validateCategory(
  body: Record<string, unknown>,
  cats: Category[],
  current: Category | null,
): { patch: Record<string, unknown>; key: string; errors: string[] } {
  const errors: string[] = [];
  const patch: Record<string, unknown> = {};
  for (const f of TEXT_FIELDS) if (f in body) patch[f] = String(body[f] ?? '').trim();
  if ('sort_order' in body) patch.sort_order = Math.round(Number(body.sort_order) || 0);
  if ('is_visible' in body) patch.is_visible = !!body.is_visible;

  const name = (f: string) => String(patch[f] ?? current?.[f as keyof Category] ?? '').trim();
  if (!name('name_ru')) errors.push('Укажите название на русском.');
  if (!name('name_lv')) errors.push('Укажите название на латышском.');
  if (!name('name_en')) errors.push('Укажите название на английском.');

  const img = String(patch.image_url ?? '');
  if (img && !/^(\/uploads\/|https:\/\/)/.test(img)) errors.push('Изображение: укажите путь /uploads/… или ссылку https://…');

  // System categories: key, slug and parent are fixed (existing URLs depend on them)
  if (current?.is_system) return { patch, key: current.key, errors };

  const slug = String(body.slug ?? current?.slug ?? '').trim() || slugify(name('name_en') || name('name_ru'));
  if (!SLUG_RE.test(slug)) errors.push('Slug: только латинские буквы в нижнем регистре, цифры и дефисы (напр. fan-coils-wall).');
  else if (cats.some((c) => c.slug === slug && c.key !== current?.key)) errors.push(`Slug «${slug}» уже занят другой категорией.`);
  else patch.slug = slug;

  const parent = String(body.parent_key ?? '').trim() || null;
  if (parent) {
    const p = cats.find((c) => c.key === parent);
    if (!p) errors.push('Родительская категория не найдена.');
    else if (current && parent === current.key) errors.push('Категория не может быть родителем самой себя.');
    else if (p.parent_key) errors.push('Родителем может быть только категория верхнего уровня (не больше двух уровней).');
    else if (current && cats.some((c) => c.parent_key === current.key)) errors.push('У категории есть подкатегории — её нельзя вложить в другую.');
  }
  patch.parent_key = parent;

  let key = current?.key ?? slug.replace(/-/g, '_');
  if (!current) {
    const base = key;
    for (let i = 2; cats.some((c) => c.key === key); i++) key = `${base}_${i}`;
  }
  return { patch, key, errors };
}
