'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { AdminProduct } from '@/lib/adminTypes';
import type { Category } from '@/lib/categories';
import { type Article, ARTICLE_LOCALES, articleLocales, hasLocale } from '@/lib/articles';
import { useAdmin, api, revalidate, fmtDate } from '../context';
import { Badge, Button, Confirm, EmptyState, IconButton, PageHeader, Spinner } from '../ui';
import { IconDoc, IconDown, IconExternal, IconGrip, IconPencil, IconPlus, IconTrash, IconUp } from '../icons';
import ArticleEditor, { type ArticleForm, articleToForm, emptyArticle } from './ArticleEditor';

export default function Articles() {
  const { t, lang, toast } = useAdmin();
  const [rows, setRows] = useState<Article[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [deleteRow, setDeleteRow] = useState<Article | null>(null);
  // drag & drop: the row being moved and the row it would land in front of / after
  const [dragId, setDragId] = useState<number | null>(null);
  const [over, setOver] = useState<{ id: number; after: boolean } | null>(null);
  const rowRefs = useRef(new Map<number, HTMLTableRowElement>());

  const load = () => api<Article[]>('/api/admin/articles').then((d) => setRows(d ?? []));
  useEffect(() => {
    load();
    api<AdminProduct[]>('/api/admin/products').then((d) => setProducts(d ?? [])).catch(() => {});
    api<{ categories: Category[] }>('/api/admin/categories').then((d) => setCats(d?.categories ?? [])).catch(() => {});
  }, []);

  const title = (a: Article) => (lang === 'lv' ? a.title_lv : lang === 'en' ? a.title_en : a.title_ru) || a.title_ru || a.title_lv || a.title_en || a.slug;
  const catLabel = { cooling: t.catCooling, heating: t.catHeating, subsidy: t.catSubsidy };
  const siteUrl = (a: Article) => {
    const l = (['lv', 'ru', 'en'] as const).find((x) => hasLocale(a, x));
    return l ? `/${l}/blog/${a.slug}` : null;
  };

  const onSaved = (a: Article) => {
    toast(t.saved);
    setRows((p) => (p?.some((x) => x.id === a.id) ? p.map((x) => (x.id === a.id ? a : x)) : [a, ...(p ?? [])]));
  };
  const remove = async () => {
    if (!deleteRow) return;
    await api(`/api/admin/articles/${deleteRow.id}`, { method: 'DELETE' });
    await revalidate();
    setDeleteRow(null);
    load();
  };

  // ── order ────────────────────────────────────────────────────────────
  const saveOrder = async (next: Article[]) => {
    const prev = rows;
    setRows(next);
    try {
      setRows(await api<Article[]>('/api/admin/articles/order', { method: 'PUT', json: { ids: next.map((a) => a.id) } }));
      await revalidate();
      toast(t.artOrderSaved);
    } catch (e) {
      setRows(prev);
      toast(`${t.error}: ${(e as Error).message}`, 'err');
    }
  };
  const moveBy = (i: number, delta: number) => {
    if (!rows) return;
    const j = i + delta;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    saveOrder(next);
  };
  const onDragOver = (e: DragEvent<HTMLTableRowElement>, id: number) => {
    if (dragId === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const box = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > box.top + box.height / 2;
    if (over?.id !== id || over.after !== after) setOver({ id, after });
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!rows || dragId === null || !over || over.id === dragId) { endDrag(); return; }
    const moving = rows.find((a) => a.id === dragId)!;
    const rest = rows.filter((a) => a.id !== dragId);
    let at = rest.findIndex((a) => a.id === over.id);
    if (over.after) at++;
    const next = [...rest.slice(0, at), moving, ...rest.slice(at)];
    endDrag();
    if (next.some((a, i) => a.id !== rows[i].id)) saveOrder(next);
  };
  const endDrag = () => { setDragId(null); setOver(null); };

  return (
    <div>
      <PageHeader title={t.artTitle} desc={t.artDesc}
        actions={<Button onClick={() => setForm(emptyArticle())}><IconPlus className="h-4 w-4" />{t.artAdd}</Button>} />

      {!rows ? <div className="py-16 text-center"><Spinner /></div> : rows.length === 0 ? (
        <div className="card"><EmptyState title={t.artEmpty} desc={t.artEmptyDesc} icon={<IconDoc className="h-6 w-6" />} /></div>
      ) : (
        <>
          {rows.length > 1 && <p className="mb-3 text-theme-sm text-gray-500 dark:text-gray-400">{t.artOrderHint}</p>}
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-theme-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="w-10 py-3 pl-3"><span className="sr-only">{t.artDrag}</span></th>
                  <th className="px-3 py-3 font-medium">{t.colName}</th>
                  <th className="px-3 py-3 font-medium">{t.artCategory}</th>
                  <th className="px-3 py-3 font-medium">{t.artLangs}</th>
                  <th className="px-3 py-3 font-medium">{t.reqStatus}</th>
                  <th className="px-3 py-3 font-medium">{t.artChanged}</th>
                  <th className="px-3 py-3 text-right font-medium">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((a, i) => {
                  const url = a.is_published ? siteUrl(a) : null;
                  const langs = articleLocales(a);
                  const line = over?.id === a.id && dragId !== a.id
                    ? (over.after ? 'shadow-[inset_0_-3px_0_0_#27C4A0]' : 'shadow-[inset_0_3px_0_0_#27C4A0]')
                    : '';
                  return (
                    <tr key={a.id} ref={(el) => { if (el) rowRefs.current.set(a.id, el); else rowRefs.current.delete(a.id); }}
                      onDragOver={(e) => onDragOver(e, a.id)} onDrop={onDrop}
                      className={`text-theme-sm transition-opacity ${dragId === a.id ? 'opacity-40' : ''} ${line}`}>
                      <td className="py-3 pl-3">
                        <span draggable title={t.artDrag} aria-hidden="true"
                          onDragStart={(e) => {
                            setDragId(a.id);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(a.id));
                            const row = rowRefs.current.get(a.id);
                            if (row) e.dataTransfer.setDragImage(row, 24, row.offsetHeight / 2);
                          }}
                          onDragEnd={endDrag}
                          className="flex h-9 w-7 cursor-grab items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing dark:hover:bg-white/5 dark:hover:text-gray-200">
                          <IconGrip className="h-5 w-5" />
                        </span>
                      </td>
                      <td className="max-w-[420px] px-3 py-3">
                        <button type="button" onClick={() => setForm(articleToForm(a))} className="block max-w-full truncate text-left font-medium text-gray-800 hover:text-brand-600 dark:text-white/90 dark:hover:text-accent">{title(a)}</button>
                        <span className="block truncate font-mono text-theme-xs text-gray-400">/blog/{a.slug}</span>
                      </td>
                      <td className="px-3 py-3"><Badge color={a.category === 'heating' ? 'warning' : a.category === 'subsidy' ? 'brand' : 'info'}>{catLabel[a.category]}</Badge></td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          {ARTICLE_LOCALES.map((l) => (
                            <span key={l} className={`rounded px-1.5 py-0.5 text-theme-xs font-semibold ${langs.includes(l) ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500' : 'bg-gray-100 text-gray-400 line-through dark:bg-white/5'}`}>{l.toUpperCase()}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3"><Badge color={a.is_published ? 'success' : 'gray'}>{a.is_published ? t.artPublished : t.artDraft}</Badge></td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-500 dark:text-gray-400">{fmtDate(a.updated_at, lang)}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <IconButton label={t.moveUp} onClick={() => moveBy(i, -1)} disabled={i === 0}><IconUp className="h-4 w-4" /></IconButton>
                          <IconButton label={t.moveDown} onClick={() => moveBy(i, 1)} disabled={i === rows.length - 1}><IconDown className="h-4 w-4" /></IconButton>
                          {url && <a href={url} target="_blank" rel="noopener" title={t.artOpen} aria-label={t.artOpen} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"><IconExternal className="h-4 w-4" /></a>}
                          <IconButton label={t.edit} onClick={() => setForm(articleToForm(a))}><IconPencil className="h-4 w-4" /></IconButton>
                          <IconButton label={t.del} onClick={() => setDeleteRow(a)} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {form && <ArticleEditor initial={form} products={products} cats={cats} onClose={() => { setForm(null); load(); }} onSaved={onSaved} />}

      <Confirm open={!!deleteRow} title={t.deleteConfirm} text={deleteRow ? `«${title(deleteRow)}». ${t.cannotUndo}` : ''} confirmLabel={t.confirmDelete} cancelLabel={t.cancel}
        onCancel={() => setDeleteRow(null)} onConfirm={remove} />
    </div>
  );
}
