'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminProduct } from '@/components/admin/adminStrings';
import { type Category, categoryTree, descendantKeys } from '@/lib/categories';
import { EMPTY_PRODUCT, EMPTY_SPECS, productToForm, productCopyForm, firstImage, type ProductForm } from '@/lib/adminShared';
import { useAdmin, api, revalidate, fmtDate } from '../context';
import { Badge, Button, Confirm, Dropdown, EmptyState, IconButton, PageHeader, Pagination, Spinner } from '../ui';
import { IconBox, IconColumns, IconCopy, IconPencil, IconPlus, IconSearch, IconTrash, IconImage } from '../icons';
import ProductEditor from './ProductEditor';

type ColKey = 'photo' | 'name' | 'brand' | 'category' | 'power' | 'price' | 'class' | 'stock' | 'date';
const ALL_COLS: ColKey[] = ['photo', 'name', 'brand', 'category', 'power', 'price', 'class', 'stock', 'date'];
const COLS_KEY = 'adminV2ProductCols';
// Actions stay visible when the table scrolls horizontally
const STICKY_COL = 'sticky right-0 bg-white shadow-[-8px_0_8px_-8px_rgba(16,24,40,0.12)] dark:bg-[#131720]';

export default function Products() {
  const { t, lang, query, editId, clearEdit, toast } = useAdmin();
  const [rows, setRows] = useState<AdminProduct[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState(query);
  const [brand, setBrand] = useState('');
  const [cat, setCat] = useState('');
  const [photo, setPhoto] = useState<'' | 'with' | 'without'>('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'name'>('newest');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [cols, setCols] = useState<ColKey[]>(ALL_COLS);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [confirm, setConfirm] = useState<AdminProduct | null>(null);

  const load = async () => {
    const [p, c] = await Promise.all([
      api<AdminProduct[]>('/api/admin/products'),
      api<{ categories: Category[] }>('/api/admin/categories').catch(() => ({ categories: [] })),
    ]);
    setRows(p ?? []);
    setCats(c.categories ?? []);
  };
  useEffect(() => {
    load();
    try { const s = JSON.parse(localStorage.getItem(COLS_KEY) || 'null'); if (Array.isArray(s)) setCols(s); } catch { /* */ }
  }, []);
  useEffect(() => { setQ(query); }, [query]);
  useEffect(() => { setPage(1); }, [q, brand, cat, photo, sort, perPage]);
  // Opened from the dashboard ("edit" on a product with photo problems)
  useEffect(() => {
    if (!editId || !rows) return;
    const p = rows.find((x) => x.id === editId);
    if (p) setForm(productToForm(p));
    clearEdit();
  }, [editId, rows, clearEdit]);

  const toggleCol = (c: ColKey) => setCols((prev) => {
    const next = prev.includes(c) ? prev.filter((x) => x !== c) : ALL_COLS.filter((x) => x === c || prev.includes(x));
    try { localStorage.setItem(COLS_KEY, JSON.stringify(next)); } catch { /* */ }
    return next;
  });

  const tree = useMemo(() => categoryTree(cats), [cats]);
  const catName = (key: string) => {
    const c = cats.find((x) => x.key === key);
    if (!c) return key;
    const nm = (x: Category) => (lang === 'lv' ? x.name_lv : lang === 'en' ? x.name_en : x.name_ru) || x.name_ru;
    const parent = c.parent_key ? cats.find((x) => x.key === c.parent_key) : null;
    return parent ? `${nm(parent)} → ${nm(c)}` : nm(c);
  };
  const brands = useMemo(() => Array.from(new Set((rows ?? []).map((p) => p.brand))).sort(), [rows]);
  const name = (p: AdminProduct) => (lang === 'lv' ? p.name_lv : lang === 'en' ? p.name_en : p.name_ru) || p.name_en || p.name_ru;

  const filtered = useMemo(() => {
    let list = rows ?? [];
    if (brand) list = list.filter((p) => p.brand === brand);
    if (cat) { const keys = descendantKeys(cats, cat); list = list.filter((p) => keys.has(p.category)); }
    if (photo) list = list.filter((p) => (photo === 'with') === !!firstImage(p.image_url));
    const n = q.trim().toLowerCase();
    if (n) list = list.filter((p) => [p.brand, p.name_lv, p.name_ru, p.name_en].join(' ').toLowerCase().includes(n));
    const byDate = (a: AdminProduct, b: AdminProduct) => (a.created_at ?? '').localeCompare(b.created_at ?? '');
    const sorted = [...list];
    if (sort === 'newest') sorted.sort((a, b) => byDate(b, a));
    if (sort === 'oldest') sorted.sort(byDate);
    if (sort === 'priceAsc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'name') sorted.sort((a, b) => name(a).localeCompare(name(b)));
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, brand, cat, photo, q, sort, cats, lang]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const shown = filtered.slice((page - 1) * perPage, page * perPage);
  const hasFilters = !!(brand || cat || photo || q);

  // Same DELETE + revalidate as the old admin
  const remove = async (p: AdminProduct) => {
    await api(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    setRows((prev) => prev?.filter((x) => x.id !== p.id) ?? prev);
    setConfirm(null);
    await revalidate();
    toast(t.saved);
  };

  const onSaved = (p: AdminProduct, isNew: boolean) => {
    setRows((prev) => (isNew ? [p, ...(prev ?? [])] : prev?.map((x) => (x.id === p.id ? p : x)) ?? prev));
    setForm(null);
    toast(t.saved);
  };

  const colLabel: Record<ColKey, string> = {
    photo: t.colPhoto, name: t.colName, brand: t.colBrand, category: t.colCategory, power: t.colPower,
    price: t.colPrice, class: t.colClass, stock: t.colStock, date: t.colDate,
  };
  const th = 'whitespace-nowrap px-4 py-3 font-medium';

  return (
    <div>
      <PageHeader title={t.prodTitle} desc={rows ? `${filtered.length} ${t.shownOf} · ${rows.length}` : undefined}
        actions={<Button onClick={() => setForm({ ...EMPTY_PRODUCT, specs: { ...EMPTY_SPECS } })}><IconPlus className="h-4 w-4" />{t.prodAdd}</Button>} />

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="relative min-w-[220px] flex-1">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="field-input pl-10" placeholder={t.searchPh} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.searchPh} />
          </div>
          <select className="field-input w-auto min-w-[150px]" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label={t.filterBrand}>
            <option value="">{t.filterBrand}: {t.all}</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="field-input w-auto min-w-[180px]" value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t.filterCategory}>
            <option value="">{t.filterCategory}: {t.all}</option>
            {tree.map(({ cat: c, children }) => [
              <option key={c.key} value={c.key}>{catName(c.key)}</option>,
              ...children.map((ch) => <option key={ch.key} value={ch.key}>{catName(ch.key)}</option>),
            ])}
          </select>
          <select className="field-input w-auto" value={photo} onChange={(e) => setPhoto(e.target.value as typeof photo)} aria-label={t.filterPhoto}>
            <option value="">{t.filterPhoto}: {t.all}</option>
            <option value="with">{t.withPhoto}</option>
            <option value="without">{t.withoutPhoto}</option>
          </select>
          <select className="field-input w-auto" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
            <option value="newest">{t.sortNewest}</option>
            <option value="oldest">{t.sortOldest}</option>
            <option value="priceAsc">{t.sortPriceAsc}</option>
            <option value="priceDesc">{t.sortPriceDesc}</option>
            <option value="name">{t.sortName}</option>
          </select>
          {hasFilters && <Button variant="ghost" size="sm" onClick={() => { setQ(''); setBrand(''); setCat(''); setPhoto(''); }}>{t.reset}</Button>}
          <Dropdown align="left" trigger={() => <Button variant="outline" size="sm"><IconColumns className="h-4 w-4" />{t.columns}</Button>}>
            {ALL_COLS.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-theme-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
                <input type="checkbox" checked={cols.includes(c)} onChange={() => toggleCol(c)} className="accent-brand-500" />
                {colLabel[c]}
              </label>
            ))}
          </Dropdown>
        </div>

        {!rows ? <div className="py-16 text-center"><Spinner /></div> : filtered.length === 0 ? (
          <EmptyState title={t.noData} icon={<IconBox className="h-6 w-6" />} />
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full text-left text-theme-sm">
              <thead className="border-b border-gray-100 text-theme-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <tr>
                  {ALL_COLS.filter((c) => cols.includes(c)).map((c) => <th key={c} className={th}>{colLabel[c]}</th>)}
                  <th className={`${th} text-right ${STICKY_COL}`}>{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {shown.map((p) => {
                  const img = firstImage(p.image_url);
                  const final = p.discount_percent ? Math.round(p.price * (1 - p.discount_percent / 100)) : p.price;
                  const cell: Record<ColKey, React.ReactNode> = {
                    photo: (
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
                        {img ? <img src={img} alt="" className="h-full w-full object-contain" loading="lazy" /> : <IconImage className="h-5 w-5 text-gray-400" />}
                      </div>
                    ),
                    name: (
                      <div className="min-w-[200px] max-w-[320px]">
                        <p className="font-medium text-gray-800 dark:text-white/90">{name(p)}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.is_hit && <Badge color="warning">{t.hit}</Badge>}
                          {p.is_promo && <Badge color="error">{t.promo}</Badge>}
                          {!!p.discount_percent && <Badge color="warning">−{p.discount_percent}%</Badge>}
                        </div>
                      </div>
                    ),
                    brand: <span className="text-gray-700 dark:text-gray-300">{p.brand}</span>,
                    category: <span className="text-gray-600 dark:text-gray-400">{catName(p.category)}</span>,
                    power: <span className="whitespace-nowrap">{p.power_kw} kW</span>,
                    price: p.price ? (
                      <span className="whitespace-nowrap">
                        {p.discount_percent ? <span className="mr-1 text-gray-400 line-through">{p.price} €</span> : null}
                        <span className="font-medium text-gray-800 dark:text-white/90">{final} €</span>
                      </span>
                    ) : <span className="text-gray-400">—</span>,
                    class: p.energy_class ? <Badge color="brand">{p.energy_class}</Badge> : <span className="text-gray-400">—</span>,
                    stock: <Badge color={p.in_stock ? 'success' : 'error'}>{p.in_stock ? t.inStock : t.outOfStock}</Badge>,
                    date: <span className="whitespace-nowrap text-gray-500 dark:text-gray-400">{p.created_at ? fmtDate(p.created_at, lang, false) : '—'}</span>,
                  };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      {ALL_COLS.filter((c) => cols.includes(c)).map((c) => <td key={c} className="px-4 py-3">{cell[c]}</td>)}
                      <td className={`whitespace-nowrap px-2 py-2 text-right ${STICKY_COL}`}>
                        <IconButton label={t.edit} onClick={() => setForm(productToForm(p))}><IconPencil className="h-4 w-4" /></IconButton>
                        <IconButton label={t.copy} onClick={() => setForm(productCopyForm(p))}><IconCopy className="h-4 w-4" /></IconButton>
                        <IconButton label={t.del} onClick={() => setConfirm(p)} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-theme-sm text-gray-500 dark:border-gray-800">
          <label className="flex items-center gap-2">{t.rowsPerPage}
            <select className="field-input h-9 w-auto py-1" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
              {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <Pagination page={page} pages={pages} onPage={setPage} labels={{ prev: t.prev, next: t.next }} />
        </div>
      </div>

      {form && <ProductEditor initial={form} cats={cats} products={rows ?? []} onClose={() => setForm(null)} onSaved={onSaved} />}
      <Confirm open={!!confirm} title={`${t.deleteConfirm} ${confirm ? name(confirm) : ''}`} text={t.cannotUndo}
        confirmLabel={t.confirmDelete} cancelLabel={t.cancel} onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  );
}
