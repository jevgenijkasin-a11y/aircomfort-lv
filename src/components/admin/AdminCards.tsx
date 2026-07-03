'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lang, T } from './adminStrings';
import { EmployeeCard } from '@/app/admin/actions/cards';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const CARD_STR = {
  ru: {
    title: 'Визитки сотрудников',
    add: 'Добавить сотрудника',
    edit: 'Редактировать',
    del: 'Удалить',
    delConfirm: 'Удалить эту визитку?',
    save: 'Сохранить',
    cancel: 'Отмена',
    addTitle: 'Новая визитка',
    editTitle: 'Редактировать визитку',
    name: 'Имя (полное)',
    position: 'Должность',
    phone: 'Телефон',
    email: 'Email',
    slug: 'URL-ключ (slug)',
    slugHint: 'Только латинские буквы, цифры, дефис. Пример: ivans-berzins',
    photo: 'Фото',
    photoClick: 'Нажмите для загрузки фото',
    active: 'Активна (видна по ссылке)',
    qr: 'QR-код',
    downloadQr: 'Скачать QR',
    link: 'Ссылка',
    empty: 'Визиток пока нет',
    emptyDesc: 'Добавьте первую визитку сотрудника',
    uploading: 'Загрузка...',
  },
  en: {
    title: 'Employee Cards',
    add: 'Add Employee',
    edit: 'Edit',
    del: 'Delete',
    delConfirm: 'Delete this card?',
    save: 'Save',
    cancel: 'Cancel',
    addTitle: 'New Card',
    editTitle: 'Edit Card',
    name: 'Full Name',
    position: 'Position',
    phone: 'Phone',
    email: 'Email',
    slug: 'URL slug',
    slugHint: 'Latin letters, digits, hyphens only. E.g. ivans-berzins',
    photo: 'Photo',
    photoClick: 'Click to upload photo',
    active: 'Active (visible by link)',
    qr: 'QR Code',
    downloadQr: 'Download QR',
    link: 'Link',
    empty: 'No cards yet',
    emptyDesc: 'Add the first employee card',
    uploading: 'Uploading...',
  },
} as const;

const BLANK: Omit<EmployeeCard, 'id' | 'created_at' | 'token'> = {
  slug: '',
  name: '',
  position: '',
  phone: '',
  email: '',
  photo_url: null,
  is_active: true,
};

interface QrImageProps {
  url: string;
  size?: number;
}

function QrImage({ url, size = 160 }: QrImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(url, { width: size, margin: 1, color: { dark: '#0B1929', light: '#FFFFFF' } })
        .then((dataUrl) => { if (!cancelled) setSrc(dataUrl); })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [url, size]);

  if (!src) return <div className="w-40 h-40 bg-white/5 rounded-xl animate-pulse" />;
  return <img src={src} alt="QR" className="w-40 h-40 rounded-xl" />;
}

function downloadQr(url: string, slug: string) {
  import('qrcode').then((QRCode) => {
    QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: '#0B1929', light: '#FFFFFF' } })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qr-${slug}.png`;
        a.click();
      });
  });
}

export default function AdminCards({ lang }: { lang: Lang }) {
  const s = CARD_STR[lang];
  const g = T[lang];
  const [cards, setCards] = useState<EmployeeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<EmployeeCard, 'id' | 'created_at' | 'token'>>(BLANK);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedQr, setExpandedQr] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/cards');
      setCards(data as EmployeeCard[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(BLANK); setEditId(null); setShowForm(true); };

  const openEdit = (c: EmployeeCard) => {
    setForm({ slug: c.slug, name: c.name, position: c.position, phone: c.phone, email: c.email, photo_url: c.photo_url, is_active: c.is_active });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.name || !form.phone || !form.email) return;
    setSaving(true);
    try {
      if (editId !== null) {
        await apiFetch(`/api/admin/cards/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/admin/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(s.delConfirm)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/admin/cards/${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-photo', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
      const { url } = await res.json();
      setForm(f => ({ ...f, photo_url: url }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const cardUrl = (token: string) => `https://aircomfort.lv/card/${token}`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{s.title}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {s.add}
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[#0D2137] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-5">{editId !== null ? s.editTitle : s.addTitle}</h2>

            <div className="space-y-4">
              {/* Photo */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{s.photo}</label>
                <div className="flex items-center gap-3">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/15" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="text-sm text-[#27C4A0] hover:text-white border border-[#27C4A0]/40 hover:bg-[#27C4A0]/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {uploadingPhoto ? s.uploading : s.photoClick}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>

              {[
                { key: 'name', label: s.name },
                { key: 'position', label: s.position },
                { key: 'phone', label: s.phone },
                { key: 'email', label: s.email },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-white/50 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/60"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-white/50 mb-1.5">{s.slug}</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className="w-full bg-white/5 border border-white/15 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/60 font-mono"
                  placeholder="ivans-berzins"
                />
                <p className="text-xs text-white/30 mt-1">{s.slugHint}</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#27C4A0]"
                />
                <span className="text-sm text-white/70">{s.active}</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                {s.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.slug || !form.name || !form.phone || !form.email}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] disabled:opacity-50 transition-colors"
              >
                {saving ? g.saving : s.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#27C4A0]/30 border-t-[#27C4A0] rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="font-medium">{s.empty}</p>
          <p className="text-sm mt-1">{s.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-[#0D2137] rounded-2xl border border-white/8 overflow-hidden">
              <div className="p-5 flex items-start gap-4">
                {/* Avatar */}
                {card.photo_url ? (
                  <img src={card.photo_url} alt={card.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#27C4A0]/30 to-[#1A6B9A]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-[#27C4A0]">
                      {card.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{card.name}</span>
                    {!card.is_active && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Неактивна</span>
                    )}
                  </div>
                  <p className="text-[#27C4A0] text-sm">{card.position}</p>
                  <p className="text-white/40 text-xs mt-1">{card.phone} · {card.email}</p>
                  <a
                    href={cardUrl(card.token)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-white/30 hover:text-[#27C4A0] transition-colors font-mono mt-1 block truncate"
                  >
                    aircomfort.lv/card/{card.slug}
                  </a>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedQr(expandedQr === card.id ? null : card.id)}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                    title={s.qr}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openEdit(card)}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* QR panel */}
              {expandedQr === card.id && (
                <div className="border-t border-white/8 p-5 flex flex-col sm:flex-row items-center gap-5 bg-white/2">
                  <QrImage url={cardUrl(card.token)} size={160} />
                  <div className="space-y-3">
                    <p className="text-sm text-white/60">{s.link}:</p>
                    <a
                      href={cardUrl(card.token)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#27C4A0] text-sm font-mono break-all hover:underline"
                    >
                      {cardUrl(card.token)}
                    </a>
                    <button
                      onClick={() => downloadQr(cardUrl(card.token), card.slug)}
                      className="flex items-center gap-2 bg-white/8 hover:bg-white/14 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      {s.downloadQr}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
