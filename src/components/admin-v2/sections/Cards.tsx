'use client';

import { useEffect, useState } from 'react';
import type { EmployeeCard } from '@/lib/types';
import { useAdmin, api, uploadImage } from '../context';
import { Badge, Button, Confirm, EmptyState, Field, IconButton, Modal, PageHeader, Spinner, Toggle } from '../ui';
import { IconExternal, IconPencil, IconPlus, IconQr, IconTrash, IconUser } from '../icons';

type CardForm = Omit<EmployeeCard, 'id' | 'created_at' | 'token'>;
const BLANK: CardForm = { slug: '', name: '', title: '', phone: '', email: '', photo_url: null, photo_position: 50, is_active: true };

// Same slug rules as the old admin (Latvian letters → Latin, other chars → "-")
const toSlug = (name: string) => name.toLowerCase()
  .replace(/[āàáâä]/g, 'a').replace(/[čç]/g, 'c').replace(/[ēèéê]/g, 'e')
  .replace(/[ģ]/g, 'g').replace(/[īìíî]/g, 'i').replace(/[ķ]/g, 'k')
  .replace(/[ļ]/g, 'l').replace(/[ņ]/g, 'n').replace(/[šß]/g, 's')
  .replace(/[ūùúû]/g, 'u').replace(/[žź]/g, 'z').replace(/[ö]/g, 'o')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slugTyping = (v: string) => toSlug(v + 'x').slice(0, -1);
const cardUrl = (key: string) => `https://aircomfort.lv/card/${key}`;

async function qrDataUrl(url: string, width: number) {
  const QRCode = await import('qrcode');
  return QRCode.toDataURL(url, { width, margin: width > 300 ? 2 : 1, color: { dark: '#0B1929', light: '#FFFFFF' } });
}
function Qr({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { let off = false; qrDataUrl(url, 160).then((d) => { if (!off) setSrc(d); }).catch(() => {}); return () => { off = true; }; }, [url]);
  return src ? <img src={src} alt="QR" className="h-40 w-40 rounded-xl" /> : <div className="h-40 w-40 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />;
}
const downloadQr = async (url: string, slug: string) => {
  const a = document.createElement('a');
  a.href = await qrDataUrl(url, 512);
  a.download = `qr-${slug}.png`;
  a.click();
};

export default function Cards() {
  const { t, toast } = useAdmin();
  const [cards, setCards] = useState<EmployeeCard[] | null>(null);
  const [form, setForm] = useState<CardForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qrOpen, setQrOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<EmployeeCard | null>(null);

  const load = () => api<EmployeeCard[]>('/api/admin/cards').then((d) => setCards(d ?? []));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(BLANK); setEditId(null); setErr(null); };
  const openEdit = (c: EmployeeCard) => {
    setForm({ slug: c.slug, name: c.name, title: c.title, phone: c.phone, email: c.email, photo_url: c.photo_url, photo_position: c.photo_position ?? 50, is_active: c.is_active });
    setEditId(c.id); setErr(null);
  };
  const set = <K extends keyof CardForm>(k: K, v: CardForm[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form || !form.slug || !form.name || !form.phone || !form.email) return;
    setSaving(true); setErr(null);
    try {
      await api(editId ? `/api/admin/cards/${editId}` : '/api/admin/cards', { method: editId ? 'PATCH' : 'POST', json: form });
      setForm(null);
      toast(t.saved);
      load();
    } catch (e) { setErr((e as Error).message); } finally { setSaving(false); }
  };
  const remove = async (c: EmployeeCard) => {
    await api(`/api/admin/cards/${c.id}`, { method: 'DELETE' });
    setConfirm(null);
    load();
  };

  return (
    <div>
      <PageHeader title={t.cardsTitle} actions={<Button onClick={openAdd}><IconPlus className="h-4 w-4" />{t.cardsAdd}</Button>} />
      {!cards ? <div className="py-16 text-center"><Spinner /></div> : cards.length === 0 ? (
        <div className="card"><EmptyState title={t.cardsEmpty} icon={<IconUser className="h-6 w-6" />} /></div>
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {cards.map((c) => {
            const url = cardUrl(c.slug || c.token);
            return (
              <div key={c.id} className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                    {c.photo_url ? <img src={c.photo_url} alt="" className="h-full w-full object-cover" style={{ objectPosition: `center ${c.photo_position ?? 50}%` }} /> : <IconUser className="m-4 h-6 w-6 text-gray-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 dark:text-white/90">{c.name} {!c.is_active && <Badge color="gray">{t.hidden}</Badge>}</p>
                    <p className="text-theme-sm text-brand-600 dark:text-accent">{c.title}</p>
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">{c.phone} · {c.email}</p>
                    <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-mono text-theme-xs text-gray-500 hover:text-brand-600 dark:text-gray-400">
                      aircomfort.lv/card/{c.slug || c.token} <IconExternal className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="flex">
                    <IconButton label={t.cardQr} onClick={() => setQrOpen(qrOpen === c.id ? null : c.id)}><IconQr className="h-4 w-4" /></IconButton>
                    <IconButton label={t.edit} onClick={() => openEdit(c)}><IconPencil className="h-4 w-4" /></IconButton>
                    <IconButton label={t.del} onClick={() => setConfirm(c)} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>
                  </div>
                </div>
                {qrOpen === c.id && (
                  <div className="mt-4 flex flex-wrap items-center gap-5 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <Qr url={url} />
                    <div className="space-y-2">
                      <p className="text-theme-xs text-gray-500">{t.cardLink}</p>
                      <a href={url} target="_blank" rel="noreferrer" className="block break-all font-mono text-theme-sm text-brand-600 dark:text-accent">{url}</a>
                      <Button variant="outline" size="sm" onClick={() => downloadQr(url, c.slug || c.token)}>{t.cardDownloadQr}</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={editId ? t.cardEdit : t.cardNew}
        footer={<>
          {err && <p className="mr-auto rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">{err}</p>}
          <Button variant="outline" onClick={() => setForm(null)}>{t.cancel}</Button>
          <Button onClick={save} disabled={saving || !form?.slug || !form?.name || !form?.phone || !form?.email}>{saving ? t.saving : t.save}</Button>
        </>}>
        {form && (
          <div className="space-y-4">
            <Field label={t.cardPhoto}>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                  {form.photo_url && <img src={form.photo_url} alt="" className="h-full w-full object-cover" style={{ objectPosition: `center ${form.photo_position}%` }} />}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:ring-gray-700 dark:hover:bg-white/5">{uploading ? t.uploading : t.upload}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; e.target.value = '';
                    if (!file) return;
                    setUploading(true);
                    try { set('photo_url', await uploadImage(file, '/api/admin/upload-photo')); } catch (x) { setErr((x as Error).message); } finally { setUploading(false); }
                  }} />
                </label>
              </div>
            </Field>
            {form.photo_url && (
              <Field label={`${t.cardPhotoPos}: ${form.photo_position}%`}>
                <input type="range" min={0} max={100} value={form.photo_position} onChange={(e) => set('photo_position', Number(e.target.value))} className="w-full accent-brand-500" />
              </Field>
            )}
            <Field label={t.cardName}>
              <input className="field-input" value={form.name} onChange={(e) => { const v = e.target.value; setForm((f) => f && ({ ...f, name: v, slug: editId ? f.slug : toSlug(v) })); }} />
            </Field>
            <Field label={t.cardSlug} hint={t.cardSlugHint}>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center rounded-lg border border-gray-300 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-gray-700">
                  <span className="whitespace-nowrap pl-3 text-sm text-gray-400">aircomfort.lv/card/</span>
                  <input className="h-11 min-w-0 flex-1 bg-transparent pr-3 font-mono text-sm text-gray-800 focus:outline-none dark:text-white/90" value={form.slug} onChange={(e) => set('slug', slugTyping(e.target.value))} placeholder="ivans-berzins" aria-label={t.cardSlug} />
                </div>
                <Button variant="outline" size="sm" onClick={() => set('slug', toSlug(form.name))}>{t.cardSlugFromName}</Button>
              </div>
              {editId && <p className="mt-1.5 text-theme-xs text-warning-600 dark:text-orange-400">{t.cardSlugWarn}</p>}
            </Field>
            <Field label={t.cardJob}><input className="field-input" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t.setPhone}><input className="field-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
              <Field label={t.setEmail}><input className="field-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
            </div>
            <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label={t.cardActive} />
          </div>
        )}
      </Modal>

      <Confirm open={!!confirm} title={`${t.deleteConfirm} ${confirm?.name ?? ''}`} text={t.cannotUndo} confirmLabel={t.confirmDelete} cancelLabel={t.cancel}
        onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove(confirm)} />
    </div>
  );
}
