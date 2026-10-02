'use client';

import { useEffect, useState } from 'react';
import type { AdminProduct } from '@/components/admin/adminStrings';
import type { Category } from '@/lib/categories';
import { type Article, ARTICLE_LOCALES, articleLocales, hasLocale } from '@/lib/articles';
import { useAdmin, api, revalidate, fmtDate } from '../context';
import { Badge, Button, Confirm, EmptyState, IconButton, PageHeader, Spinner } from '../ui';
import { IconDoc, IconExternal, IconPencil, IconPlus, IconTrash } from '../icons';
import ArticleEditor, { type ArticleForm, articleToForm, emptyArticle } from './ArticleEditor';

export default function Articles() {
  const { t, lang, toast } = useAdmin();
  const [rows, setRows] = useState<Article[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [deleteRow, setDeleteRow] = useState<Article | null>(null);

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

  return (
    <div>
      <PageHeader title={t.artTitle} desc={t.artDesc}
        actions={<Button onClick={() => setForm(emptyArticle())}><IconPlus className="h-4 w-4" />{t.artAdd}</Button>} />

      {!rows ? <div className="py-16 text-center"><Spinner /></div> : rows.length === 0 ? (
        <div className="card"><EmptyState title={t.artEmpty} desc={t.artEmptyDesc} icon={<IconDoc className="h-6 w-6" />} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-theme-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-5 py-3 font-medium">{t.colName}</th>
                <th className="px-3 py-3 font-medium">{t.artCategory}</th>
                <th className="px-3 py-3 font-medium">{t.artLangs}</th>
                <th className="px-3 py-3 font-medium">{t.reqStatus}</th>
                <th className="px-3 py-3 font-medium">{t.artChanged}</th>
                <th className="px-3 py-3 text-right font-medium">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((a) => {
                const url = a.is_published ? siteUrl(a) : null;
                const langs = articleLocales(a);
                return (
                  <tr key={a.id} className="text-theme-sm">
                    <td className="max-w-[420px] px-5 py-3">
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
      )}

      {form && <ArticleEditor initial={form} products={products} cats={cats} onClose={() => { setForm(null); load(); }} onSaved={onSaved} />}

      <Confirm open={!!deleteRow} title={t.deleteConfirm} text={deleteRow ? `«${title(deleteRow)}». ${t.cannotUndo}` : ''} confirmLabel={t.confirmDelete} cancelLabel={t.cancel}
        onCancel={() => setDeleteRow(null)} onConfirm={remove} />
    </div>
  );
}
