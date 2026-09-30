'use client';

import { useEffect, useState } from 'react';
import { TEXT_KEYS, settingsMap } from '@/lib/adminShared';
import { useAdmin, api, revalidate } from '../context';
import { Button, Card, Field, PageHeader, Spinner } from '../ui';

const LOCS = ['lv', 'ru', 'en'] as const;

export default function Texts() {
  const { t, toast } = useAdmin();
  const [texts, setTexts] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ key: string; value: string }[]>('/api/admin/settings').then((rows) => {
      const map = settingsMap(rows);
      const state: Record<string, string> = {};
      TEXT_KEYS.forEach((k) => { state[k] = map[k] ?? ''; });
      setTexts(state);
    });
  }, []);

  // Same PUT /api/admin/settings + revalidate as the old admin
  const save = async () => {
    if (!texts) return;
    setSaving(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', json: Object.entries(texts).map(([key, value]) => ({ key, value })) });
      await revalidate();
      toast(t.saved);
    } finally { setSaving(false); }
  };

  if (!texts) return <div className="py-16 text-center"><Spinner /></div>;
  const set = (k: string, v: string) => setTexts((p) => ({ ...(p ?? {}), [k]: v }));
  const triple = (base: string, label: string, area = false) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {LOCS.map((l) => (
        <Field key={l} label={`${label} ${l.toUpperCase()}`}>
          {area
            ? <textarea className="field-input" rows={2} value={texts[`${base}_${l}`]} onChange={(e) => set(`${base}_${l}`, e.target.value)} />
            : <input className="field-input" value={texts[`${base}_${l}`]} onChange={(e) => set(`${base}_${l}`, e.target.value)} />}
        </Field>
      ))}
    </div>
  );
  const group = (title: string, base: string) => (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-theme-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
      {triple(base, t.tName)}
      {triple(`${base}_desc`, t.tDesc, true)}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t.textsTitle} actions={<Button onClick={save} disabled={saving}>{saving ? t.saving : t.save}</Button>} />
      <Card title={t.textsHero}>
        <div className="space-y-4">{triple('hero_title', t.tTitle)}{triple('hero_subtitle', t.tSubtitle, true)}</div>
      </Card>
      <Card title={t.textsServices}>
        <div className="space-y-4">
          {triple('services_title', t.tTitle)}{triple('services_subtitle', t.tSubtitle)}
          {group(t.svcSupply, 'svc_supply')}{group(t.svcInstall, 'svc_install')}{group(t.svcMaint, 'svc_maint')}{group(t.svcConsult, 'svc_consult')}
        </div>
      </Card>
      <Card title={t.textsCats}>
        <div className="space-y-4">
          {triple('cats_title', t.tTitle)}{triple('cats_subtitle', t.tSubtitle)}
          {group(t.catHome, 'cat_home')}{group(t.catHp, 'cat_hp')}{group(t.catComm, 'cat_comm')}{group(t.catIhp, 'cat_ihp')}
        </div>
      </Card>
      <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? t.saving : t.save}</Button></div>
    </div>
  );
}
