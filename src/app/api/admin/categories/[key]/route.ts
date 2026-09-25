export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listCategories, categoryProductCounts, getCategory, updateCategory, deleteCategory } from '@/lib/db';
import { validateCategory } from '@/lib/categoryValidation';

type Params = { params: Promise<{ key: string }> };
const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { key } = await params;
  const current = getCategory(key);
  if (!current) return NextResponse.json({ error: 'Категория не найдена.' }, { status: 404 });
  const { patch, errors } = validateCategory(await req.json(), listCategories(), current);
  if (errors.length) return NextResponse.json({ error: errors.join(' '), errors }, { status: 400 });
  return NextResponse.json(updateCategory(key, patch));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauth();
  const { key } = await params;
  const cats = listCategories();
  const current = cats.find((c) => c.key === key);
  if (!current) return NextResponse.json({ error: 'Категория не найдена.' }, { status: 404 });
  if (current.is_system) {
    return NextResponse.json({ error: 'Системную категорию удалить нельзя: на неё ссылаются страницы сайта.' }, { status: 409 });
  }
  const children = cats.filter((c) => c.parent_key === key);
  if (children.length) {
    return NextResponse.json({ error: `Нельзя удалить: в категории есть подкатегории (${children.map((c) => c.name_ru || c.key).join(', ')}). Сначала удалите или перенесите их.` }, { status: 409 });
  }
  const n = categoryProductCounts()[key] ?? 0;
  if (n) {
    return NextResponse.json({ error: `Нельзя удалить: в категории ${n} товар(ов). Сначала перенесите их в другую категорию.` }, { status: 409 });
  }
  deleteCategory(key);
  return NextResponse.json({ success: true });
}
