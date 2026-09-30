'use client';

import { useEffect, useState } from 'react';
import type { SupabaseReview } from '@/lib/types';
import { useAdmin, api, fmtDate } from '../context';
import { Badge, Button, Confirm, EmptyState, Field, IconButton, Modal, PageHeader, Spinner, Toggle } from '../ui';
import { IconChat, IconEye, IconEyeOff, IconPencil, IconPlus, IconTrash } from '../icons';

type RevForm = Omit<SupabaseReview, 'id' | 'created_at'>;
const empty = (): RevForm => ({ author_name: '', text_ru: '', text_lv: '', text_en: '', rating: 5, is_visible: true });

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i)} aria-label={`${i}`}
          className={`text-xl leading-none ${i <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'} ${onChange ? 'hover:text-yellow-300' : 'cursor-default'}`}>★</button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t, lang, toast } = useAdmin();
  const [rows, setRows] = useState<SupabaseReview[] | null>(null);
  const [form, setForm] = useState<RevForm | null>(null);
  const [editing, setEditing] = useState<SupabaseReview | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => api<SupabaseReview[]>('/api/admin/reviews').then((d) => setRows(d ?? []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form || !form.author_name.trim()) return;
    setSaving(true);
    try {
      await api(editing ? `/api/admin/reviews/${editing.id}` : '/api/admin/reviews', { method: editing ? 'PUT' : 'POST', json: form });
      setForm(null); setEditing(null);
      toast(t.saved);
      load();
    } finally { setSaving(false); }
  };
  const toggle = async (r: SupabaseReview) => {
    await api(`/api/admin/reviews/${r.id}`, { method: 'PUT', json: { is_visible: !r.is_visible } });
    setRows((p) => p?.map((x) => (x.id === r.id ? { ...x, is_visible: !x.is_visible } : x)) ?? p);
  };
  const remove = async () => {
    if (!deleteId) return;
    await api(`/api/admin/reviews/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    load();
  };
  const text = (r: SupabaseReview) => (lang === 'lv' ? r.text_lv : lang === 'en' ? r.text_en : r.text_ru) || r.text_ru || r.text_lv || r.text_en;

  return (
    <div>
      <PageHeader title={t.revTitle} actions={<Button onClick={() => { setForm(empty()); setEditing(null); }}><IconPlus className="h-4 w-4" />{t.revAdd}</Button>} />
      {!rows ? <div className="py-16 text-center"><Spinner /></div> : rows.length === 0 ? (
        <div className="card"><EmptyState title={t.revEmpty} icon={<IconChat className="h-6 w-6" />} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className={`card p-5 ${r.is_visible ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">{r.author_name}</p>
                  <div className="mt-1 flex items-center gap-2"><Stars value={r.rating} /><span className="text-theme-xs text-gray-400">{fmtDate(r.created_at, lang, false)}</span></div>
                </div>
                <div className="flex items-center">
                  <Badge color={r.is_visible ? 'success' : 'gray'}>{r.is_visible ? t.visible : t.hidden}</Badge>
                  <IconButton label={r.is_visible ? t.hide : t.show} onClick={() => toggle(r)}>{r.is_visible ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}</IconButton>
                  <IconButton label={t.edit} onClick={() => { setEditing(r); setForm({ author_name: r.author_name, text_ru: r.text_ru, text_lv: r.text_lv, text_en: r.text_en, rating: r.rating, is_visible: r.is_visible }); }}><IconPencil className="h-4 w-4" /></IconButton>
                  <IconButton label={t.del} onClick={() => setDeleteId(r.id)} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>
                </div>
              </div>
              <p className="mt-3 text-theme-sm text-gray-600 dark:text-gray-300">{text(r)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={editing ? t.revEdit : t.revNew} size="lg"
        footer={<>
          <Button variant="outline" onClick={() => setForm(null)}>{t.cancel}</Button>
          <Button onClick={save} disabled={saving || !form?.author_name.trim()}>{saving ? t.saving : t.save}</Button>
        </>}>
        {form && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t.revAuthor}><input className="field-input" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></Field>
              <Field label={t.revRating}><Stars value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} /></Field>
            </div>
            <Field label={t.revTextRu}><textarea className="field-input" rows={3} value={form.text_ru} onChange={(e) => setForm({ ...form, text_ru: e.target.value })} /></Field>
            <Field label={t.revTextLv}><textarea className="field-input" rows={3} value={form.text_lv} onChange={(e) => setForm({ ...form, text_lv: e.target.value })} /></Field>
            <Field label={t.revTextEn}><textarea className="field-input" rows={3} value={form.text_en} onChange={(e) => setForm({ ...form, text_en: e.target.value })} /></Field>
            <Toggle checked={form.is_visible} onChange={(v) => setForm({ ...form, is_visible: v })} label={t.revVisible} />
          </div>
        )}
      </Modal>

      <Confirm open={deleteId !== null} title={t.deleteConfirm} text={t.cannotUndo} confirmLabel={t.confirmDelete} cancelLabel={t.cancel}
        onCancel={() => setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
