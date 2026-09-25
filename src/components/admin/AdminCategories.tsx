'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { T, Lang } from './adminStrings';
import { type Category, categoryTree, descendantKeys, slugify, SLUG_RE } from '@/lib/categories';

type Form = Partial<Category> & { isNew?: boolean };

const LOCS = ['lv', 'ru', 'en'] as const;
const EMPTY: Form = {
  isNew: true, parent_key: null, slug: '', name_lv: '', name_ru: '', name_en: '', sort_order: 0, is_visible: true, image_url: '',
  seo_title_lv: '', seo_title_ru: '', seo_title_en: '', seo_description_lv: '', seo_description_ru: '', seo_description_en: '',
  seo_h1_lv: '', seo_h1_ru: '', seo_h1_en: '', seo_intro_lv: '', seo_intro_ru: '', seo_intro_en: '',
};

export default function AdminCategories({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/categories');
    const d = r.ok ? await r.json() : { categories: [], counts: {} };
    setCats(d.categories);
    setCounts(d.counts);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const tree = useMemo(() => categoryTree(cats), [cats]);
  const total = (key: string) => Array.from(descendantKeys(cats, key)).reduce((n, k) => n + (counts[k] ?? 0), 0);
  const roots = cats.filter((c) => !c.parent_key);
  const set = (k: keyof Form, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const validate = (f: Form): string[] => {
    const e: string[] = [];
    if (!f.name_ru?.trim()) e.push('Укажите название на русском.');
    if (!f.name_lv?.trim()) e.push('Укажите название на латышском.');
    if (!f.name_en?.trim()) e.push('Укажите название на английском.');
    if (!f.is_system && f.slug && !SLUG_RE.test(f.slug)) e.push('Slug: только латинские буквы в нижнем регистре, цифры и дефисы.');
    return e;
  };

  const save = async () => {
    if (!form) return;
    const e = validate(form);
    setErrors(e);
    if (e.length) return;
    setSaving(true);
    const { isNew, key, is_system: _s, ...body } = form;
    const r = await fetch(isNew ? '/api/admin/categories' : `/api/admin/categories/${key}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) { setErrors(d.errors ?? [d.error ?? `HTTP ${r.status}`]); return; }
    await fetch('/api/admin/revalidate', { method: 'POST' });
    setForm(null);
    load();
  };

  const remove = async (c: Category) => {
    const r = await fetch(`/api/admin/categories/${c.key}`, { method: 'DELETE' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setDeleteError(d.error ?? `HTTP ${r.status}`); return; }
    setConfirm(null);
    await fetch('/api/admin/revalidate', { method: 'POST' });
    load();
  };

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const d = await r.json().catch(() => ({}));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (r.ok && d.url) set('image_url', d.url);
    else setErrors([d.error ?? `HTTP ${r.status}`]);
  };

  const inp = 'w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/20 disabled:opacity-50';
  const lbl = 'block text-xs text-white/50 mb-1.5 font-medium';
  const hdr = 'text-white/60 text-xs font-semibold uppercase tracking-widest mb-3 pb-2 border-b border-white/8';

  const Row = ({ c, child }: { c: Category; child?: boolean }) => (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 ${child ? 'pl-10 bg-white/[0.015]' : ''}`}>
      {child && <span className="text-white/20">└</span>}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {lang === 'ru' ? c.name_ru : c.name_en}
          <span className="text-white/30 font-normal ml-2 text-xs">/{c.slug}</span>
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/8 text-white/60">{total(c.key)} {s.catProducts}</span>
          {c.is_system && <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#1A6B9A]/30 text-[#7cc4f0]">{s.catSystem}</span>}
          {!c.is_visible && <span className="text-[11px] px-2 py-0.5 rounded-lg bg-red-500/15 text-red-300">{s.catHidden}</span>}
        </div>
      </div>
      {!child && !c.is_system && (
        <button onClick={() => { setErrors([]); setForm({ ...EMPTY, parent_key: c.key, sort_order: (cats.filter((x) => x.parent_key === c.key).length + 1) * 10 }); }}
          className="text-xs text-[#27C4A0] bg-[#27C4A0]/10 hover:bg-[#27C4A0]/20 px-2.5 py-1.5 rounded-lg transition-colors">+ {s.catAddSub}</button>
      )}
      <button onClick={() => { setErrors([]); setForm({ ...c }); }} className="text-xs text-white bg-white/8 hover:bg-white/12 px-2.5 py-1.5 rounded-lg transition-colors">{s.prodEdit}</button>
      {!c.is_system && (
        <button onClick={() => { setDeleteError(null); setConfirm(c); }} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" aria-label={s.prodDelete}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">{s.catTitle}</h1>
        <button onClick={() => { setErrors([]); setForm({ ...EMPTY, sort_order: (roots.length + 1) * 10 }); }}
          className="flex items-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
          + {s.catAdd}
        </button>
      </div>
      <p className="text-white/40 text-sm mb-6">{s.catDesc}</p>

      {loading ? (
        <div className="text-center py-20 text-white/40">{s.loading}</div>
      ) : (
        <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
          {tree.map(({ cat, children }) => (
            <div key={cat.key}>
              <Row c={cat} />
              {children.map((ch) => <Row key={ch.key} c={ch} child />)}
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6">
          <div className="w-full max-w-5xl max-h-[95vh] bg-[#0D2137] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="font-bold text-white text-lg">{form.isNew ? s.catAddTitle : s.catEditTitle}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10" aria-label={s.prodCancel}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className={hdr}>{lang === 'ru' ? 'Основное' : 'Basics'}</p>
                {form.is_system && <p className="text-xs text-[#7cc4f0] bg-[#1A6B9A]/20 border border-[#1A6B9A]/30 rounded-lg px-3 py-2">{s.catSystemNote}</p>}
                {LOCS.map((l) => (
                  <div key={l}>
                    <label className={lbl}>{s[`catName${l.charAt(0).toUpperCase()}${l.slice(1)}` as 'catNameRu']}</label>
                    <input className={inp} value={form[`name_${l}`] ?? ''} onChange={(e) => set(`name_${l}`, e.target.value)} />
                  </div>
                ))}
                <div>
                  <label className={lbl}>{s.catSlug}</label>
                  <div className="flex gap-2">
                    <input className={`${inp} flex-1 font-mono`} value={form.slug ?? ''} disabled={form.is_system} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="fan-coils-wall" />
                    {!form.is_system && (
                      <button type="button" onClick={() => set('slug', slugify(form.name_en || form.name_ru || ''))} className="text-xs text-white/70 bg-white/8 hover:bg-white/12 px-3 rounded-xl">{s.catSlugAuto}</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{s.catParent}</label>
                    <select className={inp} style={{ background: '#0D2137' }} value={form.parent_key ?? ''} disabled={form.is_system}
                      onChange={(e) => set('parent_key', e.target.value || null)}>
                      <option value="">{s.catNoParent}</option>
                      {roots.filter((r) => r.key !== form.key).map((r) => <option key={r.key} value={r.key}>{lang === 'ru' ? r.name_ru : r.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>{s.catSort}</label>
                    <input className={inp} type="number" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!form.is_visible} onChange={(e) => set('is_visible', e.target.checked)} className="w-4 h-4 accent-[#27C4A0]" />
                  <span className="text-sm text-white/70">{s.catVisible}</span>
                </label>
                <div>
                  <label className={lbl}>{s.catImage}</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                      {form.image_url ? <img src={form.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-white/20 text-xs">—</span>}
                    </div>
                    <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="text-xs text-white bg-white/8 hover:bg-white/12 px-3 py-2 rounded-lg">{uploading ? s.loading : s.catImageUpload}</button>
                    {form.image_url && <button type="button" onClick={() => set('image_url', '')} className="text-xs text-red-300 hover:text-red-200">{s.catImageRemove}</button>}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className={hdr}>{s.catSeo}</p>
                {LOCS.map((l) => (
                  <div key={l} className="space-y-2 bg-white/[0.02] border border-white/8 rounded-xl p-3">
                    <p className="text-[11px] font-bold text-[#27C4A0] uppercase">{l}</p>
                    <input className={inp} placeholder={s.catSeoH1} value={form[`seo_h1_${l}`] ?? ''} onChange={(e) => set(`seo_h1_${l}`, e.target.value)} />
                    <input className={inp} placeholder={s.catSeoTitle} value={form[`seo_title_${l}`] ?? ''} onChange={(e) => set(`seo_title_${l}`, e.target.value)} />
                    <textarea className={`${inp} resize-none`} rows={2} placeholder={s.catSeoDesc} value={form[`seo_description_${l}`] ?? ''} onChange={(e) => set(`seo_description_${l}`, e.target.value)} />
                    <textarea className={`${inp} resize-none`} rows={3} placeholder={s.catSeoIntro} value={form[`seo_intro_${l}`] ?? ''} onChange={(e) => set(`seo_intro_${l}`, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mx-6 mb-3 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 space-y-0.5" role="alert">
                {errors.map((e) => <p key={e}>{e}</p>)}
              </div>
            )}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <button onClick={save} disabled={saving} className="flex-1 bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 text-[#0B1929] font-semibold py-3 rounded-xl">{saving ? s.saving : s.prodSave}</button>
              <button onClick={() => setForm(null)} className="px-6 bg-white/8 hover:bg-white/12 text-white font-semibold py-3 rounded-xl">{s.prodCancel}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D2137] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <p className="text-white font-semibold text-lg mb-1">{s.catDeleteConfirm}</p>
            <p className="text-white/50 text-sm mb-4">{lang === 'ru' ? confirm.name_ru : confirm.name_en}</p>
            {deleteError && <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4" role="alert">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => remove(confirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl">{s.confirm}</button>
              <button onClick={() => setConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 rounded-xl">{s.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
