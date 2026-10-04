'use client';

// Article form: language tabs (LV/RU/EN) with title, SEO fields and markdown
// text with a live preview rendered by the same code as the public page.
import { useMemo, useRef, useState, type ReactNode } from 'react';
import type { AdminProduct } from '@/lib/adminTypes';
import { type Category, slugify } from '@/lib/categories';
import { type Article, type Loc, ARTICLE_CATEGORIES, ARTICLE_LOCALES, hasLocale, renderMarkdown, extractFaq } from '@/lib/articles';
import { firstImage } from '@/lib/adminShared';
import { useAdmin, api, revalidate, uploadImage } from '../context';
import { Badge, Button, Field, Modal, Spinner, Toggle } from '../ui';
import { IconUpload, IconX } from '../icons';

export type ArticleForm = Omit<Article, 'id' | 'sort_order' | 'published_at' | 'created_at' | 'updated_at'> & { id?: number };

export const emptyArticle = (): ArticleForm => ({
  slug: '', category: 'heating',
  title_lv: '', title_ru: '', title_en: '',
  meta_title_lv: '', meta_title_ru: '', meta_title_en: '',
  meta_description_lv: '', meta_description_ru: '', meta_description_en: '',
  body_lv: '', body_ru: '', body_en: '',
  cover_url: '', cover_idea: '', related_catalog: '', related_product_ids: [], is_published: false,
});

export const articleToForm = (a: Article): ArticleForm => {
  const { published_at: _p, created_at: _c, updated_at: _u, sort_order: _s, ...rest } = a;
  return rest;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
      <h4 className="mb-4 text-theme-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** "12 / 60" counter, orange when over the recommended length. */
const Counter = ({ value, max, label }: { value: string; max: number; label: string }) => (
  <span className={`text-theme-xs ${value.length > max ? 'font-semibold text-warning-600 dark:text-warning-500' : 'text-gray-400'}`}>
    {value.length} / {max} {label}
  </span>
);

export default function ArticleEditor({ initial, products, cats, onClose, onSaved }: {
  initial: ArticleForm; products: AdminProduct[]; cats: Category[];
  onClose: () => void; onSaved: (a: Article) => void;
}) {
  const { t, lang } = useAdmin();
  const [f, setF] = useState<ArticleForm>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [tab, setTab] = useState<Loc>(() => ARTICLE_LOCALES.find((l) => hasLocale(initial, l)) ?? 'lv');
  const [mode, setMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prodQ, setProdQ] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const wasPublished = useRef(initial.is_published && !!initial.id);
  const initialSlug = useRef(initial.slug);

  const set = <K extends keyof ArticleForm>(k: K, v: ArticleForm[K]) => setF((p) => ({ ...p, [k]: v }));
  const dirty = JSON.stringify(f) !== saved;
  const close = () => { if (!dirty || window.confirm(t.artUnsaved)) onClose(); };

  const body = f[`body_${tab}`];
  const html = useMemo(() => (mode === 'edit' ? '' : renderMarkdown(body)), [body, mode]);
  const faq = useMemo(() => extractFaq(body).length, [body]);

  const catName = (c: Category) => (lang === 'lv' ? c.name_lv : lang === 'en' ? c.name_en : c.name_ru) || c.name_ru || c.key;
  const catalogOptions = useMemo(() => {
    const opts = [{ value: '/catalog', label: lang === 'lv' ? 'Viss katalogs' : lang === 'en' ? 'Whole catalog' : 'Весь каталог' }];
    for (const c of cats) {
      const parent = c.parent_key ? cats.find((x) => x.key === c.parent_key) : null;
      opts.push({
        value: c.is_system ? `/catalog/type/${c.slug}` : `/catalog/category/${c.slug}`,
        label: parent ? `${catName(parent)} → ${catName(c)}` : catName(c),
      });
    }
    if (f.related_catalog && !opts.some((o) => o.value === f.related_catalog)) opts.push({ value: f.related_catalog, label: f.related_catalog });
    return opts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats, lang, f.related_catalog]);

  const pname = (p: AdminProduct) => `${p.brand} ${p.name_ru || p.name_lv || p.name_en}`.trim();
  const picked = f.related_product_ids;
  const candidates = useMemo(() => {
    const q = prodQ.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => !picked.includes(p.id) && [p.brand, p.name_lv, p.name_ru, p.name_en].join(' ').toLowerCase().includes(q))
      .slice(0, 30);
  }, [products, prodQ, picked]);
  const toggleProduct = (id: string) => set('related_product_ids', picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  const upload = async (file: File) => {
    setUploading(true);
    try { set('cover_url', await uploadImage(file)); }
    catch (e) { setErrors([(e as Error).message]); }
    finally { setUploading(false); }
  };

  const save = async () => {
    setErrors([]);
    setSaving(true);
    try {
      const { id, ...payload } = f;
      const a = await api<Article>(id ? `/api/admin/articles/${id}` : '/api/admin/articles', { method: id ? 'PUT' : 'POST', json: payload });
      await revalidate();
      const next = articleToForm(a);
      setF(next);
      setSaved(JSON.stringify(next));
      wasPublished.current = a.is_published;
      initialSlug.current = a.slug;
      onSaved(a);
    } catch (e) {
      const err = e as Error & { errors?: string[] };
      setErrors(err.errors ?? [err.message]);
    } finally {
      setSaving(false);
    }
  };

  const catLabel = { cooling: t.catCooling, heating: t.catHeating, subsidy: t.catSubsidy };

  return (
    <Modal open onClose={close} size="xl" title={f.id ? t.artEditTitle : t.artNewTitle}
      footer={<>
        {errors.length > 0 && (
          <div className="mr-auto max-w-2xl rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">
            <b>{t.notSaved}:</b> {errors.join(' ')}
          </div>
        )}
        <Button variant="outline" onClick={close}>{t.close}</Button>
        <Button onClick={save} disabled={saving || uploading || !dirty}>{saving ? t.saving : t.save}</Button>
      </>}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Texts per language */}
        <div className="space-y-5 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t.artLangs}>
            {ARTICLE_LOCALES.map((l) => (
              <button key={l} type="button" role="tab" aria-selected={tab === l} onClick={() => setTab(l)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-theme-sm font-semibold ${tab === l ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'}`}>
                {l.toUpperCase()}
                <span className={`h-2 w-2 rounded-full ${hasLocale(f, l) ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'}`} aria-hidden="true" />
              </button>
            ))}
          </div>
          {!hasLocale(f, tab) && <p className="rounded-lg bg-warning-50 px-3 py-2 text-theme-sm text-warning-700 dark:bg-warning-500/15 dark:text-warning-500">{t.artLangMissing}</p>}

          <Field label={`${t.artTitleF} · ${tab.toUpperCase()}`}>
            <input className="field-input" value={f[`title_${tab}`]} onChange={(e) => set(`title_${tab}`, e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={t.artMetaTitle} hint={<Counter value={f[`meta_title_${tab}`]} max={60} label={t.artChars} />}>
              <input className="field-input" value={f[`meta_title_${tab}`]} onChange={(e) => set(`meta_title_${tab}`, e.target.value)} />
            </Field>
            <Field label={t.artMetaDesc} hint={<Counter value={f[`meta_description_${tab}`]} max={160} label={t.artChars} />}>
              <textarea className="field-input resize-y" rows={3} value={f[`meta_description_${tab}`]} onChange={(e) => set(`meta_description_${tab}`, e.target.value)} />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="field-label !mb-0">{t.artBody}</span>
              <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-white/5" role="group">
                {(['edit', 'split', 'preview'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
                    className={`rounded-md px-3 py-1.5 text-theme-xs font-semibold ${mode === m ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {m === 'edit' ? t.artEditor : m === 'split' ? t.artSplit : t.artPreview}
                  </button>
                ))}
              </div>
            </div>
            <div className={`grid gap-3 ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
              {mode !== 'preview' && (
                <textarea className="field-input min-h-[520px] resize-y font-mono !text-[13px] leading-relaxed" spellCheck
                  value={body} onChange={(e) => set(`body_${tab}`, e.target.value)} aria-label={`${t.artBody} ${tab.toUpperCase()}`} />
              )}
              {mode !== 'edit' && (
                <div className="custom-scrollbar max-h-[720px] min-h-[520px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
                  {f[`title_${tab}`] && <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{f[`title_${tab}`]}</h1>}
                  <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-theme-xs text-gray-400">
              <span className="font-mono">{t.artMdHelp}</span>
              <span className={faq ? 'text-success-600 dark:text-success-500' : ''}>{faq ? `${t.artFaq}: ${faq}` : t.artNoFaq}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-5">
          <Section title={t.secBasic}>
            <Toggle checked={f.is_published} onChange={(v) => set('is_published', v)} label={t.artPublished} />
            <p className="field-hint !mt-0">{t.artPublishHint}</p>
            <Field label={t.artSlug} hint={t.artSlugHint}>
              <div className="flex gap-2">
                <input className="field-input min-w-0 font-mono" value={f.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="siltumsuknis-gaiss-udens" />
                <Button variant="outline" size="sm" type="button" className="flex-shrink-0 whitespace-nowrap" onClick={() => set('slug', slugify(f.title_lv || f.title_en || f.title_ru))} disabled={!(f.title_lv || f.title_en || f.title_ru)}>{t.artFromTitle}</Button>
              </div>
            </Field>
            {wasPublished.current && f.slug !== initialSlug.current && <p className="text-theme-xs text-warning-600 dark:text-warning-500">{t.artSlugWarn}</p>}
            <Field label={t.artCategory}>
              <select className="field-input" value={f.category} onChange={(e) => set('category', e.target.value as ArticleForm['category'])}>
                {ARTICLE_CATEGORIES.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
              </select>
            </Field>
          </Section>

          <Section title={t.artCover}>
            {f.cover_url ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <img src={f.cover_url} alt={f[`title_${tab}`] || t.artCover} className="aspect-video w-full object-cover" />
                <button type="button" onClick={() => set('cover_url', '')} className="absolute right-2 top-2 rounded-full bg-gray-900/70 p-1.5 text-white hover:bg-error-500" aria-label={t.artCoverRemove} title={t.artCoverRemove}>
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) upload(file); }} />
            <Button variant="outline" type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Spinner className="h-4 w-4" /> : <IconUpload className="h-4 w-4" />}{uploading ? t.uploading : t.artCoverUpload}
            </Button>
            {f.cover_idea && (
              <p className="rounded-lg bg-gray-50 px-3 py-2 text-theme-xs text-gray-500 dark:bg-white/5 dark:text-gray-400"><b>{t.artCoverIdea}:</b> {f.cover_idea}</p>
            )}
          </Section>

          <Section title={t.artCatalog}>
            <select className="field-input" value={f.related_catalog} onChange={(e) => set('related_catalog', e.target.value)} aria-label={t.artCatalog}>
              <option value="">{t.artCatalogNone}</option>
              {catalogOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="field-hint !mt-0">{t.artCatalogHint}</p>
          </Section>

          <Section title={`${t.artProducts} (${picked.length})`}>
            <p className="field-hint !mt-0">{t.artProductsHint}</p>
            {picked.length > 0 && (
              <ul className="space-y-1.5">
                {picked.map((id) => {
                  const p = products.find((x) => x.id === id);
                  return (
                    <li key={id} className="flex items-center gap-2 rounded-lg border border-gray-200 p-1.5 dark:border-gray-800">
                      {p && firstImage(p.image_url) ? <img src={firstImage(p.image_url)} alt={pname(p)} className="h-9 w-9 flex-shrink-0 rounded bg-gray-50 object-contain" /> : <span className="h-9 w-9 flex-shrink-0 rounded bg-gray-100 dark:bg-white/5" />}
                      <span className="min-w-0 flex-1 truncate text-theme-sm text-gray-700 dark:text-gray-300">{p ? pname(p) : id}</span>
                      {p && !p.in_stock && <Badge color="gray">{t.outOfStock}</Badge>}
                      <button type="button" onClick={() => toggleProduct(id)} className="rounded p-1 text-gray-400 hover:text-error-500" aria-label={t.del}><IconX className="h-4 w-4" /></button>
                    </li>
                  );
                })}
              </ul>
            )}
            <input className="field-input" value={prodQ} onChange={(e) => setProdQ(e.target.value)} placeholder={t.searchPh} aria-label={t.artProducts} />
            {prodQ.trim() && (
              <ul className="custom-scrollbar max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {candidates.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => toggleProduct(p.id)} className="flex w-full justify-between gap-2 px-3 py-2 text-left text-theme-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                      <span className="truncate">{pname(p)}</span>
                      <span className="flex-shrink-0 text-gray-400">{p.in_stock ? (p.price ? `${p.price} €` : '') : t.outOfStock}</span>
                    </button>
                  </li>
                ))}
                {candidates.length === 0 && <li className="px-3 py-2 text-theme-sm text-gray-400">{t.noData}</li>}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </Modal>
  );
}
