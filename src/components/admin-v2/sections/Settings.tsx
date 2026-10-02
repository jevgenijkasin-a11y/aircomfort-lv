'use client';

import { useEffect, useState } from 'react';
import type { SiteSettings } from '@/lib/adminTypes';
import { SETTINGS_DEFAULTS, settingsMap } from '@/lib/adminShared';
import { useAdmin, api, revalidate } from '../context';
import { Button, Card, Field, PageHeader, Spinner } from '../ui';

const LOCS = ['lv', 'ru', 'en'] as const;
type K = keyof SiteSettings;

export default function Settings() {
  const { t, toast } = useAdmin();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ key: string; value: string }[]>('/api/admin/settings').then((rows) => {
      const map = settingsMap(rows);
      const next = { ...SETTINGS_DEFAULTS };
      (Object.keys(next) as K[]).forEach((k) => { if (map[k] !== undefined) next[k] = map[k]; });
      setS(next);
    });
  }, []);

  // Same PUT /api/admin/settings + revalidate as the old admin
  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', json: Object.entries(s).map(([key, value]) => ({ key, value })) });
      await revalidate();
      toast(t.saved);
    } finally { setSaving(false); }
  };

  if (!s) return <div className="py-16 text-center"><Spinner /></div>;
  const input = (k: K, label: string, type = 'text') => (
    <Field label={label}><input className="field-input" type={type} value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></Field>
  );
  const triple = (base: string, label: string) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {LOCS.map((l) => <div key={l}>{input(`${base}_${l}` as K, `${label} ${l.toUpperCase()}`)}</div>)}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t.setTitle} actions={<Button onClick={save} disabled={saving}>{saving ? t.saving : t.save}</Button>} />
      <Card title={t.setContacts}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {input('phone', t.setPhone)}{input('email', t.setEmail, 'email')}{input('address', t.setAddress)}{input('hours', t.setHours)}
          {input('whatsapp_number', t.setWhatsapp)}{input('telegram_username', t.setTelegram)}
        </div>
      </Card>
      <Card title={t.setHero}><div className="space-y-4">{triple('hero_title', t.tTitle)}{triple('hero_subtitle', t.tSubtitle)}</div></Card>
      <Card title={t.setStats}>
        <div className="space-y-5">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {input(`stat${n}_value` as K, `${t.setValue} ${n}`)}
              {LOCS.map((l) => <div key={l}>{input(`stat${n}_label_${l}` as K, `${t.setLabel} ${n} ${l.toUpperCase()}`)}</div>)}
            </div>
          ))}
        </div>
      </Card>
      <Card title={t.setContactsPage}>
        <div className="space-y-4">{triple('contacts_title', t.tTitle)}{triple('contacts_subtitle', t.tSubtitle)}{triple('contacts_form_title', t.setFormTitle)}</div>
      </Card>
      <Card title={t.setPrices}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{input('install_price_from', t.setInstallFrom, 'number')}{input('install_price_to', t.setInstallTo, 'number')}</div>
      </Card>
      <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? t.saving : t.save}</Button></div>
    </div>
  );
}
