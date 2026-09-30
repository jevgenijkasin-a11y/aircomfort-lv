'use client';

import { useEffect, useState } from 'react';
import type { SupabaseHeroSlide } from '@/lib/types';
import { useAdmin, api, uploadImage } from '../context';
import { Badge, Button, Confirm, EmptyState, IconButton, PageHeader, Spinner } from '../ui';
import { IconDown, IconEye, IconEyeOff, IconImage, IconTrash, IconUp, IconUpload } from '../icons';

export default function Slider() {
  const { t } = useAdmin();
  const [slides, setSlides] = useState<SupabaseHeroSlide[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = () => api<SupabaseHeroSlide[]>('/api/admin/slides').then((d) => setSlides(d ?? []));
  useEffect(() => { load(); }, []);

  // Same calls as the old admin: upload → POST slide; PUT sort_order / is_visible; DELETE
  const upload = async (file: File) => {
    setUploading(true); setErr(null);
    try {
      const url = await uploadImage(file);
      await api('/api/admin/slides', { method: 'POST', json: { image_url: url } });
      await load();
    } catch (e) { setErr((e as Error).message); } finally { setUploading(false); }
  };
  const patch = (id: number, p: { sort_order?: number; is_visible?: boolean }) => api(`/api/admin/slides/${id}`, { method: 'PUT', json: p });
  const toggle = async (s: SupabaseHeroSlide) => {
    await patch(s.id, { is_visible: !s.is_visible });
    setSlides((prev) => prev?.map((x) => (x.id === s.id ? { ...x, is_visible: !x.is_visible } : x)) ?? prev);
  };
  const swap = async (i: number, j: number) => {
    if (!slides || j < 0 || j >= slides.length) return;
    const a = slides[i], b = slides[j];
    await Promise.all([patch(a.id, { sort_order: b.sort_order }), patch(b.id, { sort_order: a.sort_order })]);
    const next = [...slides];
    next[i] = { ...a, sort_order: b.sort_order };
    next[j] = { ...b, sort_order: a.sort_order };
    setSlides(next.sort((x, y) => x.sort_order - y.sort_order));
  };
  const remove = async (id: number) => {
    await api(`/api/admin/slides/${id}`, { method: 'DELETE' });
    setSlides((prev) => prev?.filter((s) => s.id !== id) ?? prev);
    setConfirmId(null);
  };

  return (
    <div>
      <PageHeader title={t.sliderTitle} desc={t.sliderDesc} actions={
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
          {uploading ? <Spinner className="h-4 w-4" /> : <IconUpload className="h-4 w-4" />}{uploading ? t.uploading : t.sliderUpload}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
        </label>
      } />
      {err && <p className="mb-4 rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">{t.error}: {err}</p>}
      {!slides ? <div className="py-16 text-center"><Spinner /></div> : slides.length === 0 ? (
        <div className="card"><EmptyState title={t.sliderEmpty} icon={<IconImage className="h-6 w-6" />} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((s, i) => (
            <div key={s.id} className={`card overflow-hidden ${s.is_visible ? '' : 'opacity-60'}`}>
              <div className="relative aspect-video bg-gray-100 dark:bg-white/5">
                <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2"><Badge color={s.is_visible ? 'success' : 'gray'}>{s.is_visible ? t.visible : t.hidden}</Badge></span>
                <span className="absolute right-2 top-2 rounded-full bg-gray-900/70 px-2 text-theme-xs font-bold text-white">#{i + 1}</span>
              </div>
              <div className="flex items-center justify-between gap-1 p-3">
                <div className="flex">
                  <IconButton label={t.moveUp} onClick={() => swap(i, i - 1)} disabled={i === 0}><IconUp className="h-4 w-4" /></IconButton>
                  <IconButton label={t.moveDown} onClick={() => swap(i, i + 1)} disabled={i === slides.length - 1}><IconDown className="h-4 w-4" /></IconButton>
                </div>
                <div className="flex">
                  <Button variant="ghost" size="sm" onClick={() => toggle(s)}>{s.is_visible ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}{s.is_visible ? t.hide : t.show}</Button>
                  <IconButton label={t.del} onClick={() => setConfirmId(s.id)} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Confirm open={confirmId !== null} title={t.deleteConfirm} text={t.cannotUndo} confirmLabel={t.confirmDelete} cancelLabel={t.cancel}
        onCancel={() => setConfirmId(null)} onConfirm={() => confirmId !== null && remove(confirmId)} />
    </div>
  );
}
