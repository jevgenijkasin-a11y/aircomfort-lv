'use client';

import { useState, useEffect, useRef } from 'react';
import { T, Lang } from './adminStrings';
import { SupabaseHeroSlide } from '@/lib/types';

export default function AdminSlider({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [slides, setSlides] = useState<SupabaseHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/slides');
    const data = r.ok ? await r.json() : [];
    setSlides((data ?? []) as SupabaseHeroSlide[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await r.json().catch(() => ({}));
    if (r.ok && json.url) {
      await fetch('/api/admin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: json.url }),
      });
      await load();
    } else {
      setUploadError(json.error || `HTTP ${r.status}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const patchSlide = (id: number, patch: { sort_order?: number; is_visible?: boolean }) =>
    fetch(`/api/admin/slides/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });

  const toggleVisible = async (slide: SupabaseHeroSlide) => {
    await patchSlide(slide.id, { is_visible: !slide.is_visible });
    setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, is_visible: !s.is_visible } : s));
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const a = slides[index];
    const b = slides[index - 1];
    await Promise.all([
      patchSlide(a.id, { sort_order: b.sort_order }),
      patchSlide(b.id, { sort_order: a.sort_order }),
    ]);
    const updated = [...slides];
    updated[index] = { ...a, sort_order: b.sort_order };
    updated[index - 1] = { ...b, sort_order: a.sort_order };
    setSlides(updated.sort((x, y) => x.sort_order - y.sort_order));
  };

  const moveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const a = slides[index];
    const b = slides[index + 1];
    await Promise.all([
      patchSlide(a.id, { sort_order: b.sort_order }),
      patchSlide(b.id, { sort_order: a.sort_order }),
    ]);
    const updated = [...slides];
    updated[index] = { ...a, sort_order: b.sort_order };
    updated[index + 1] = { ...b, sort_order: a.sort_order };
    setSlides(updated.sort((x, y) => x.sort_order - y.sort_order));
  };

  const deleteSlide = async (id: number) => {
    await fetch(`/api/admin/slides/${id}`, { method: 'DELETE' });
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setConfirmId(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{s.sliderTitle}</h1>
          <p className="text-white/40 text-sm mt-1">{s.sliderDesc}</p>
        </div>
        <label className={`flex items-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              {s.sliderUploading}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {s.sliderUpload}
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
        </label>
      </div>

      {uploadError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-[#27C4A0]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="font-medium">{s.sliderEmpty}</p>
          <p className="text-sm mt-1">{s.sliderEmptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div key={slide.id} className="flex items-center gap-4 bg-white/4 border border-white/10 rounded-2xl p-4">
              <div className="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(1.05) saturate(0.88) contrast(0.96)' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs truncate">{slide.image_url}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.is_visible ? 'bg-[#27C4A0]/15 text-[#27C4A0]' : 'bg-white/8 text-white/35'}`}>
                    {slide.is_visible ? s.sliderVisible : s.sliderHidden}
                  </span>
                  <span className="text-white/25 text-xs">#{index + 1}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-2 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title={s.sliderMoveUp}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === slides.length - 1}
                  className="p-2 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title={s.sliderMoveDown}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button
                  onClick={() => toggleVisible(slide)}
                  className="p-2 text-white/40 hover:text-[#27C4A0] transition-colors"
                  title={slide.is_visible ? s.sliderHide : s.sliderShow}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {slide.is_visible
                      ? <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    }
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmId(slide.id)}
                  className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  title={s.sliderDelete}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmId(null)}>
          <div className="bg-[#0D2137] border border-white/15 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-white font-semibold mb-1">{s.sliderDeleteConfirm}</p>
            <p className="text-white/40 text-sm mb-6">{s.confirm}</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteSlide(confirmId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {s.confirm}
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 bg-white/8 hover:bg-white/12 text-white/70 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {s.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
