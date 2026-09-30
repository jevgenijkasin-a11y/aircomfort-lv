'use client';

import { useEffect, useMemo, useState } from 'react';
import { type Category, categoryTree, descendantKeys, slugify, SLUG_RE } from '@/lib/categories';
import { useAdmin, api, revalidate, uploadImage } from '../context';
import { Badge, Button, Confirm, Field, IconButton, Modal, PageHeader, Spinner, Toggle } from '../ui';
import { IconPencil, IconPlus, IconTrash } from '../icons';

type Form = Partial<Category> & { isNew?: boolean };
const LOCS = ['lv', 'ru', 'en'] as const;
const EMPTY: Form = {
  isNew: true, parent_key: null, slug: '', name_lv: '', name_ru: '', name_en: '', sort_order: 0, is_visible: true, image_url: '',
  seo_title_lv: '', seo_title_ru: '', seo_title_en: '', seo_description_lv: '', seo_description_ru: '', seo_description_en: '',
  seo_h1_lv: '', seo_h1_ru: '', seo_h1_en: '', seo_intro_lv: '', seo_intro_ru: '', seo_intro_en: '',
};

export default function Categories() {
  const { t, lang, toast } = useAdmin();
  const [cats, setCats] = useState<Category[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const [delErr, setDelErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => api<{ categories: Category[]; counts: Record<string, number> }>('/api/admin/categories')
    .then((d) => { setCats(d.categories); setCounts(d.counts); });
  useEffect(() => { load(); }, []);

  const tree = useMemo(() => categoryTree(cats ?? []), [cats]);
  const roots = (cats ?? []).filter((c) => !c.parent_key);
  const total = (key: string) => Array.from(descendantKeys(cats ?? [], key)).reduce((n, k) => n + (counts[k] ?? 0), 0);
  const name = (c: Category) => (lang === 'lv' ? c.name_lv : lang === 'en' ? c.name_en : c.name_ru) || c.name_ru;
  const set = (k: keyof Form, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form) return;
    // Same client checks as the old admin; the API validates again
    const e: string[] = [];
    if (!form.name_ru?.trim()) e.push('Укажите название на русском.');
    if (!form.name_lv?.trim()) e.push('Укажите название на латышском.');
    if (!form.name_en?.trim()) e.push('Укажите название на английском.');
    if (!form.is_system && form.slug && !SLUG_RE.test(form.slug)) e.push('Slug: только латинские буквы в нижнем регистре, цифры и дефисы.');
    setErrors(e);
    if (e.length) return;
    setSaving(true);
    const { isNew, key, is_system: _s, ...body } = form;
    try {
      await api(isNew ? '/api/admin/categories' : `/api/admin/categories/${key}`, { method: isNew ? 'POST' : 'PUT', json: body });
      await revalidate();
      setForm(null);
      toast(t.saved);
      load();
    } catch (err) {
      const x = err as Error & { errors?: string[] };
      setErrors(x.errors ?? [x.message]);
    } finally { setSaving(false); }
  };

  const remove = async (c: Category) => {
    try {
      await api(`/api/admin/categories/${c.key}`, { method: 'DELETE' });
      setConfirm(null);
      await revalidate();
      load();
    } catch (err) { setDelErr((err as Error).message); }
  };

  const Row = ({ c, child }: { c: Category; child?: boolean }) => (
    <li className={`flex flex-wrap items-center gap-3 px-5 py-3.5 ${child ? 'pl-12' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-800 dark:text-white/90">{child && <span className="mr-2 text-gray-300">└</span>}{name(c)} <span className="ml-1 font-mono text-theme-xs text-gray-400">/{c.slug}</span></p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge>{total(c.key)} {t.catProducts}</Badge>
          {c.is_system && <Badge color="info">{t.catSystem}</Badge>}
          {!c.is_visible && <Badge color="error">{t.catHidden}</Badge>}
        </div>
      </div>
      {!child && !c.is_system && (
        <Button variant="outline" size="sm" onClick={() => { setErrors([]); setForm({ ...EMPTY, parent_key: c.key, sort_order: ((cats ?? []).filter((x) => x.parent_key === c.key).length + 1) * 10 }); }}>
          <IconPlus className="h-4 w-4" />{t.catAddSub}
        </Button>
      )}
      <IconButton label={t.edit} onClick={() => { setErrors([]); setForm({ ...c }); }}><IconPencil className="h-4 w-4" /></IconButton>
      {!c.is_system && <IconButton label={t.del} onClick={() => { setDelErr(null); setConfirm(c); }} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>}
    </li>
  );

  return (
    <div>
      <PageHeader title={t.catTitle} desc={t.catDesc}
        actions={<Button onClick={() => { setErrors([]); setForm({ ...EMPTY, sort_order: (roots.length + 1) * 10 }); }}><IconPlus className="h-4 w-4" />{t.catAdd}</Button>} />
      <div className="card overflow-hidden">
        {!cats ? <div className="py-16 text-center"><Spinner /></div> : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tree.map(({ cat, children }) => [<Row key={cat.key} c={cat} />, ...children.map((ch) => <Row key={ch.key} c={ch} child />)])}
          </ul>
        )}
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} size="lg" title={form?.isNew ? t.catNewTitle : t.catEditTitle}
        footer={<>
          {errors.length > 0 && <p className="mr-auto rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">{errors.join(' ')}</p>}
          <Button variant="outline" onClick={() => setForm(null)}>{t.cancel}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t.saving : t.save}</Button>
        </>}>
        {form && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {form.is_system && <p className="rounded-lg bg-sky-50 px-3 py-2 text-theme-sm text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">{t.catSystemNote}</p>}
              {LOCS.map((l) => (
                <Field key={l} label={`${t.tName} (${l.toUpperCase()}) *`}>
                  <input className="field-input" value={form[`name_${l}`] ?? ''} onChange={(e) => set(`name_${l}`, e.target.value)} />
                </Field>
              ))}
              <Field label={t.catSlug}>
                <div className="flex gap-2">
                  <input className="field-input font-mono" value={form.slug ?? ''} disabled={form.is_system} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="fan-coils-wall" />
                  {!form.is_system && <Button variant="outline" size="sm" onClick={() => set('slug', slugify(form.name_en || form.name_ru || ''))}>{t.catSlugAuto}</Button>}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.catParent}>
                  <select className="field-input" value={form.parent_key ?? ''} disabled={form.is_system} onChange={(e) => set('parent_key', e.target.value || null)}>
                    <option value="">{t.catNoParent}</option>
                    {roots.filter((r) => r.key !== form.key).map((r) => <option key={r.key} value={r.key}>{name(r)}</option>)}
                  </select>
                </Field>
                <Field label={t.catSort}><input className="field-input" type="number" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} /></Field>
              </div>
              <Toggle checked={!!form.is_visible} onChange={(v) => set('is_visible', v)} label={t.catVisible} />
              <Field label={t.catImage}>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-white/5">
                    {form.image_url ? <img src={form.image_url} alt="" className="h-full w-full object-cover" /> : <span className="text-gray-300">—</span>}
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:ring-gray-700 dark:hover:bg-white/5">{uploading ? t.uploading : t.upload}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; e.target.value = '';
                      if (!file) return;
                      setUploading(true);
                      try { set('image_url', await uploadImage(file)); } catch (err) { setErrors([(err as Error).message]); } finally { setUploading(false); }
                    }} />
                  </label>
                  {form.image_url && <Button variant="ghost" size="sm" onClick={() => set('image_url', '')}>{t.del}</Button>}
                </div>
              </Field>
            </div>
            <div className="space-y-4">
              <p className="text-theme-sm font-semibold uppercase tracking-wide text-gray-500">{t.catSeo}</p>
              {LOCS.map((l) => (
                <div key={l} className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <p className="text-theme-xs font-bold text-brand-600 dark:text-accent">{l.toUpperCase()}</p>
                  <input className="field-input" placeholder={t.catSeoH1} aria-label={`${t.catSeoH1} ${l}`} value={form[`seo_h1_${l}`] ?? ''} onChange={(e) => set(`seo_h1_${l}`, e.target.value)} />
                  <input className="field-input" placeholder={t.catSeoTitle} aria-label={`${t.catSeoTitle} ${l}`} value={form[`seo_title_${l}`] ?? ''} onChange={(e) => set(`seo_title_${l}`, e.target.value)} />
                  <textarea className="field-input" rows={2} placeholder={t.catSeoDesc} aria-label={`${t.catSeoDesc} ${l}`} value={form[`seo_description_${l}`] ?? ''} onChange={(e) => set(`seo_description_${l}`, e.target.value)} />
                  <textarea className="field-input" rows={3} placeholder={t.catSeoIntro} aria-label={`${t.catSeoIntro} ${l}`} value={form[`seo_intro_${l}`] ?? ''} onChange={(e) => set(`seo_intro_${l}`, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Confirm open={!!confirm} title={`${t.deleteConfirm} ${confirm ? name(confirm) : ''}`} text={t.cannotUndo} error={delErr}
        confirmLabel={t.confirmDelete} cancelLabel={t.cancel} onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  );
}
