'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SupabaseReview } from '@/lib/supabase';
import { T, type Lang } from './adminStrings';

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={`text-xl ${i <= value ? 'text-yellow-400' : 'text-white/20'} ${onChange ? 'hover:text-yellow-300 transition-colors' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const empty = (): Omit<SupabaseReview, 'id' | 'created_at'> => ({
  author_name: '',
  text_ru: '',
  text_lv: '',
  text_en: '',
  rating: 5,
  is_visible: true,
});

export default function AdminReviews({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [reviews, setReviews] = useState<SupabaseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SupabaseReview | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(empty());
    setAdding(true);
    setEditing(null);
  };

  const openEdit = (r: SupabaseReview) => {
    setForm({ author_name: r.author_name, text_ru: r.text_ru, text_lv: r.text_lv, text_en: r.text_en, rating: r.rating, is_visible: r.is_visible });
    setEditing(r);
    setAdding(false);
  };

  const closeForm = () => { setAdding(false); setEditing(null); };

  const save = async () => {
    if (!form.author_name.trim()) return;
    setSaving(true);
    if (editing) {
      await supabase.from('reviews').update(form).eq('id', editing.id);
    } else {
      await supabase.from('reviews').insert(form);
    }
    setSaving(false);
    closeForm();
    load();
  };

  const toggleVisible = async (r: SupabaseReview) => {
    await supabase.from('reviews').update({ is_visible: !r.is_visible }).eq('id', r.id);
    setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, is_visible: !x.is_visible } : x));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('reviews').delete().eq('id', deleteId);
    setDeleteId(null);
    load();
  };

  const inputCls = 'w-full bg-white/5 border border-white/15 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/60 placeholder-white/20 transition-colors';
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium';

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{s.revTitle}</h1>
          <p className="text-white/35 text-sm mt-0.5">{reviews.length} {lang === 'ru' ? 'отзывов' : 'reviews'}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          {s.revAdd}
        </button>
      </div>

      {/* Form */}
      {(adding || editing) && (
        <div className="bg-[#0D2137] border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">{editing ? s.revEditTitle : s.revAddTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>{s.revAuthor} *</label>
              <input
                className={inputCls}
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                placeholder="Иван И."
              />
            </div>
            <div>
              <label className={labelCls}>{s.revTextRu}</label>
              <textarea
                rows={3}
                className={inputCls}
                value={form.text_ru}
                onChange={(e) => setForm((f) => ({ ...f, text_ru: e.target.value }))}
                placeholder="Текст отзыва на русском..."
              />
            </div>
            <div>
              <label className={labelCls}>{s.revTextLv}</label>
              <textarea
                rows={3}
                className={inputCls}
                value={form.text_lv}
                onChange={(e) => setForm((f) => ({ ...f, text_lv: e.target.value }))}
                placeholder="Atsauksmju teksts latviešu valodā..."
              />
            </div>
            <div>
              <label className={labelCls}>{s.revTextEn}</label>
              <textarea
                rows={3}
                className={inputCls}
                value={form.text_en}
                onChange={(e) => setForm((f) => ({ ...f, text_en: e.target.value }))}
                placeholder="Review text in English..."
              />
            </div>
            <div>
              <label className={labelCls}>{s.revRating}</label>
              <Stars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_visible: !f.is_visible }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.is_visible ? 'bg-[#27C4A0]' : 'bg-white/20'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_visible ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-sm text-white/60">{s.revVisible}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving || !form.author_name.trim()}
              className="bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 text-[#0B1929] font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {saving ? s.saving : s.revSave}
            </button>
            <button onClick={closeForm} className="bg-white/8 hover:bg-white/15 text-white text-sm px-5 py-2.5 rounded-xl transition-colors">
              {s.revCancel}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#27C4A0]/30 border-t-[#27C4A0] rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 text-white/15 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <p className="text-white/30 text-base">{s.revEmpty}</p>
          <p className="text-white/20 text-sm mt-1">{s.revEmptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-[#0D2137] border rounded-2xl p-4 flex gap-4 transition-all ${r.is_visible ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-semibold text-white text-sm">{r.author_name}</span>
                    <span className="text-white/30 text-xs ml-2">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.text_ru && <p className="text-white/55 text-sm leading-relaxed line-clamp-2">RU: {r.text_ru}</p>}
                {r.text_lv && <p className="text-white/40 text-xs mt-1 line-clamp-1">LV: {r.text_lv}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                <button
                  onClick={() => toggleVisible(r)}
                  title={r.is_visible ? 'Скрыть' : 'Показать'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${r.is_visible ? 'text-[#27C4A0] bg-[#27C4A0]/10 hover:bg-[#27C4A0]/20' : 'text-white/30 bg-white/5 hover:bg-white/10'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {r.is_visible
                      ? <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    }
                  </svg>
                </button>
                <button
                  onClick={() => openEdit(r)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button
                  onClick={() => setDeleteId(r.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2137] border border-white/15 rounded-2xl p-6 max-w-sm w-full">
            <p className="text-white font-semibold mb-1">{s.revDeleteConfirm}</p>
            <p className="text-white/40 text-sm mb-5">{lang === 'ru' ? 'Это действие нельзя отменить.' : 'This cannot be undone.'}</p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">{s.confirm}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-white/8 hover:bg-white/15 text-white text-sm py-2.5 rounded-xl transition-colors">{s.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
