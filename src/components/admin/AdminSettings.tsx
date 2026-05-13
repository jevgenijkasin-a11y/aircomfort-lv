'use client';

import { useState, useEffect } from 'react';
import { T, Lang, SiteSettings } from './adminStrings';
import { supabase } from '@/lib/supabase';

const DEFAULTS: SiteSettings = {
  phone: '', email: '', address: '', hours: '',
  whatsapp_number: '', telegram_username: '',
  hero_title_lv: '', hero_title_ru: '', hero_title_en: '',
  hero_subtitle_lv: '', hero_subtitle_ru: '', hero_subtitle_en: '',
  stat1_value: '500+', stat1_label_lv: '', stat1_label_ru: '', stat1_label_en: '',
  stat2_value: '5', stat2_label_lv: '', stat2_label_ru: '', stat2_label_en: '',
  stat3_value: '10+', stat3_label_lv: '', stat3_label_ru: '', stat3_label_en: '',
  contacts_title_lv: '', contacts_title_ru: '', contacts_title_en: '',
  contacts_subtitle_lv: '', contacts_subtitle_ru: '', contacts_subtitle_en: '',
  contacts_form_title_lv: '', contacts_form_title_ru: '', contacts_form_title_en: '',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 pb-1 border-b border-white/10 mb-5">
      <h2 className="text-sm font-semibold text-[#27C4A0] uppercase tracking-widest">{children}</h2>
    </div>
  );
}

export default function AdminSettings({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('key,value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
        setSettings((prev) => {
          const next = { ...prev };
          (Object.keys(prev) as (keyof SiteSettings)[]).forEach((k) => {
            if (map[k] !== undefined) next[k] = map[k];
          });
          return next;
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (k: keyof SiteSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    await fetch('/api/admin/revalidate', { method: 'POST' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inp = 'w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/20';
  const lbl = 'block text-sm font-medium text-white/50 mb-1.5';
  const row = 'space-y-5';

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-8">{s.setTitle}</h1>

      {loading ? (
        <div className="text-white/40">{s.loading}</div>
      ) : (
        <div className="space-y-2">

          <SectionTitle>Kontaktinformācija / Контакты</SectionTitle>
          <div className={row}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lbl}>{s.setPhone}</label>
                <input className={inp} value={settings.phone} onChange={set('phone')} placeholder="+371 20 000 000" />
              </div>
              <div>
                <label className={lbl}>{s.setEmail}</label>
                <input className={inp} type="email" value={settings.email} onChange={set('email')} placeholder="info@aircomfort.lv" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lbl}>{s.setAddress}</label>
                <input className={inp} value={settings.address} onChange={set('address')} placeholder="Rīga, Latvija" />
              </div>
              <div>
                <label className={lbl}>{s.setHours}</label>
                <input className={inp} value={settings.hours} onChange={set('hours')} placeholder="Pn–Pt 9:00–18:00" />
              </div>
            </div>
          </div>

          <SectionTitle>WhatsApp / Telegram</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={lbl}>{s.setWhatsapp}</label>
              <input className={inp} value={settings.whatsapp_number} onChange={set('whatsapp_number')} placeholder="+37120000000" />
            </div>
            <div>
              <label className={lbl}>{s.setTelegram}</label>
              <input className={inp} value={settings.telegram_username} onChange={set('telegram_username')} placeholder="aircomfort_lv" />
            </div>
          </div>

          <SectionTitle>{s.setHeroSection}</SectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>{s.setHeroTitleLv}</label>
                <input className={inp} value={settings.hero_title_lv} onChange={set('hero_title_lv')} placeholder="Komforts jūsu mājās" />
              </div>
              <div>
                <label className={lbl}>{s.setHeroTitleRu}</label>
                <input className={inp} value={settings.hero_title_ru} onChange={set('hero_title_ru')} placeholder="Комфорт в вашем доме" />
              </div>
              <div>
                <label className={lbl}>{s.setHeroTitleEn}</label>
                <input className={inp} value={settings.hero_title_en} onChange={set('hero_title_en')} placeholder="Year-round comfort" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>{s.setHeroSubtitleLv}</label>
                <textarea className={`${inp} resize-none`} rows={3} value={settings.hero_subtitle_lv} onChange={set('hero_subtitle_lv')} placeholder="Kondicionēšanas iekārtu piegāde..." />
              </div>
              <div>
                <label className={lbl}>{s.setHeroSubtitleRu}</label>
                <textarea className={`${inp} resize-none`} rows={3} value={settings.hero_subtitle_ru} onChange={set('hero_subtitle_ru')} placeholder="Поставка кондиционеров..." />
              </div>
              <div>
                <label className={lbl}>{s.setHeroSubtitleEn}</label>
                <textarea className={`${inp} resize-none`} rows={3} value={settings.hero_subtitle_en} onChange={set('hero_subtitle_en')} placeholder="Supply and installation..." />
              </div>
            </div>
          </div>

          <SectionTitle>{s.setStatsSection}</SectionTitle>
          <div className="space-y-4">
            {(
              [
                { vk: 'stat1_value', llk: 'stat1_label_lv', lrk: 'stat1_label_ru', lek: 'stat1_label_en', vLabel: s.setStat1Value, lLabelLv: s.setStat1LabelLv, lLabelRu: s.setStat1LabelRu, lLabelEn: s.setStat1LabelEn, ph: '500+' },
                { vk: 'stat2_value', llk: 'stat2_label_lv', lrk: 'stat2_label_ru', lek: 'stat2_label_en', vLabel: s.setStat2Value, lLabelLv: s.setStat2LabelLv, lLabelRu: s.setStat2LabelRu, lLabelEn: s.setStat2LabelEn, ph: '5' },
                { vk: 'stat3_value', llk: 'stat3_label_lv', lrk: 'stat3_label_ru', lek: 'stat3_label_en', vLabel: s.setStat3Value, lLabelLv: s.setStat3LabelLv, lLabelRu: s.setStat3LabelRu, lLabelEn: s.setStat3LabelEn, ph: '10+' },
              ] as const
            ).map(({ vk, llk, lrk, lek, vLabel, lLabelLv, lLabelRu, lLabelEn, ph }) => (
              <div key={vk} className="glass-card rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={lbl}>{vLabel}</label>
                    <input className={inp} value={settings[vk]} onChange={set(vk)} placeholder={ph} />
                  </div>
                  <div>
                    <label className={lbl}>{lLabelLv}</label>
                    <input className={inp} value={settings[llk]} onChange={set(llk)} placeholder="LV" />
                  </div>
                  <div>
                    <label className={lbl}>{lLabelRu}</label>
                    <input className={inp} value={settings[lrk]} onChange={set(lrk)} placeholder="RU" />
                  </div>
                  <div>
                    <label className={lbl}>{lLabelEn}</label>
                    <input className={inp} value={settings[lek]} onChange={set(lek)} placeholder="EN" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SectionTitle>{s.setContactsSection}</SectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>{s.setContactsTitleLv}</label>
                <input className={inp} value={settings.contacts_title_lv} onChange={set('contacts_title_lv')} placeholder="Sazinieties ar mums" />
              </div>
              <div>
                <label className={lbl}>{s.setContactsTitleRu}</label>
                <input className={inp} value={settings.contacts_title_ru} onChange={set('contacts_title_ru')} placeholder="Свяжитесь с нами" />
              </div>
              <div>
                <label className={lbl}>{s.setContactsTitleEn}</label>
                <input className={inp} value={settings.contacts_title_en} onChange={set('contacts_title_en')} placeholder="Contact Us" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>{s.setContactsSubtitleLv}</label>
                <textarea className={`${inp} resize-none`} rows={2} value={settings.contacts_subtitle_lv} onChange={set('contacts_subtitle_lv')} placeholder="Atstājiet pieprasījumu..." />
              </div>
              <div>
                <label className={lbl}>{s.setContactsSubtitleRu}</label>
                <textarea className={`${inp} resize-none`} rows={2} value={settings.contacts_subtitle_ru} onChange={set('contacts_subtitle_ru')} placeholder="Оставьте заявку..." />
              </div>
              <div>
                <label className={lbl}>{s.setContactsSubtitleEn}</label>
                <textarea className={`${inp} resize-none`} rows={2} value={settings.contacts_subtitle_en} onChange={set('contacts_subtitle_en')} placeholder="Leave a request..." />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>{s.setContactsFormTitleLv}</label>
                <input className={inp} value={settings.contacts_form_title_lv} onChange={set('contacts_form_title_lv')} placeholder="Nosūtīt pieprasījumu" />
              </div>
              <div>
                <label className={lbl}>{s.setContactsFormTitleRu}</label>
                <input className={inp} value={settings.contacts_form_title_ru} onChange={set('contacts_form_title_ru')} placeholder="Отправить заявку" />
              </div>
              <div>
                <label className={lbl}>{s.setContactsFormTitleEn}</label>
                <input className={inp} value={settings.contacts_form_title_en} onChange={set('contacts_form_title_en')} placeholder="Send Request" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 text-[#0B1929] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {s.setSaved}
                </>
              ) : saving ? s.saving : s.setSave}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPassword({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'mismatch' | 'short'>('idle');

  const change = async () => {
    if (form.newPwd.length < 6) { setStatus('short'); return; }
    if (form.newPwd !== form.confirm) { setStatus('mismatch'); return; }
    setStatus('saving');
    const r = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd }),
    });
    if (r.ok) {
      setStatus('success');
      setForm({ current: '', newPwd: '', confirm: '' });
    } else {
      setStatus('error');
    }
  };

  const inp = 'w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/20';
  const lbl = 'block text-sm font-medium text-white/50 mb-1.5';
  const errMsg = status === 'error' ? s.pwdError : status === 'mismatch' ? s.pwdMismatch : status === 'short' ? s.pwdShort : '';

  return (
    <div className="p-6 lg:p-8 max-w-md">
      <h1 className="text-2xl font-bold text-white mb-8">{s.pwdTitle}</h1>
      <div className="space-y-4">
        <div>
          <label className={lbl}>{s.pwdCurrent}</label>
          <input className={inp} type="password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
        </div>
        <div>
          <label className={lbl}>{s.pwdNew}</label>
          <input className={inp} type="password" value={form.newPwd} onChange={(e) => { setForm((f) => ({ ...f, newPwd: e.target.value })); setStatus('idle'); }} />
        </div>
        <div>
          <label className={lbl}>{s.pwdConfirm}</label>
          <input className={inp} type="password" value={form.confirm} onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setStatus('idle'); }} />
        </div>
        {status === 'success' && (
          <div className="flex items-center gap-2 text-[#27C4A0] text-sm bg-[#27C4A0]/10 border border-[#27C4A0]/20 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {s.pwdChanged}
          </div>
        )}
        {errMsg && <p className="text-red-400 text-sm">{errMsg}</p>}
        <button
          onClick={change}
          disabled={status === 'saving' || !form.current || !form.newPwd || !form.confirm}
          className="w-full bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1929] font-bold py-3.5 rounded-xl transition-colors"
        >
          {status === 'saving' ? s.saving : s.pwdChange}
        </button>
      </div>
    </div>
  );
}
