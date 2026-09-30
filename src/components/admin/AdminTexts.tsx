'use client';

import { useState, useEffect } from 'react';
import { T, Lang } from './adminStrings';
import { TEXT_KEYS } from '@/lib/adminShared';

type TextsState = Record<string, string>;

// Keys shared with /admin-v2
const ALL_KEYS = TEXT_KEYS;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-5 pb-1 border-b border-white/10 mb-5">
      <h2 className="text-sm font-semibold text-[#27C4A0] uppercase tracking-widest">{children}</h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 mt-5">{children}</p>;
}

export default function AdminTexts({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [texts, setTexts] = useState<TextsState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.ok ? r.json() : []).then((data: { key: string; value: string }[]) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
        const state: TextsState = {};
        ALL_KEYS.forEach((k) => { state[k] = map[k] ?? ''; });
        setTexts(state);
      }
      setLoading(false);
    });
  }, []);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTexts((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const rows = Object.entries(texts).map(([key, value]) => ({ key, value }));
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    });
    await fetch('/api/admin/revalidate', { method: 'POST' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inp = 'w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/20';
  const ta = `${inp} resize-none`;
  const lbl = 'block text-xs text-white/40 mb-1 font-medium';

  const triLingual = (prefix: string, label: string, isTextarea = false) => (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
      <p className="text-white/60 text-sm font-medium">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['lv', 'ru', 'en'] as const).map((l) => (
          <div key={l}>
            <label className={lbl}>{l.toUpperCase()}</label>
            {isTextarea ? (
              <textarea className={ta} rows={3} value={texts[`${prefix}_${l}`] ?? ''} onChange={set(`${prefix}_${l}`)} />
            ) : (
              <input className={inp} value={texts[`${prefix}_${l}`] ?? ''} onChange={set(`${prefix}_${l}`)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const titleLabel = lang === 'ru' ? 'Заголовок' : 'Title';
  const subtitleLabel = lang === 'ru' ? 'Подзаголовок' : 'Subtitle';
  const nameLabel = lang === 'ru' ? 'Название' : 'Name';
  const descLabel = lang === 'ru' ? 'Описание' : 'Description';

  if (loading) return <div className="p-8 text-white/40">{s.loading}</div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8">{s.textsTitle}</h1>

      <div className="space-y-2">

        <SectionTitle>{s.textsHeroSection}</SectionTitle>
        <div className="space-y-3">
          {triLingual('hero_title', titleLabel)}
          {triLingual('hero_subtitle', subtitleLabel, true)}
        </div>

        <SectionTitle>{s.textsServicesSection}</SectionTitle>
        <div className="space-y-3">
          {triLingual('services_title', titleLabel)}
          {triLingual('services_subtitle', subtitleLabel, true)}
          <SubTitle>{s.textsSupply}</SubTitle>
          {triLingual('svc_supply', nameLabel)}
          {triLingual('svc_supply_desc', descLabel, true)}
          <SubTitle>{s.textsInstall}</SubTitle>
          {triLingual('svc_install', nameLabel)}
          {triLingual('svc_install_desc', descLabel, true)}
          <SubTitle>{s.textsMaint}</SubTitle>
          {triLingual('svc_maint', nameLabel)}
          {triLingual('svc_maint_desc', descLabel, true)}
          <SubTitle>{s.textsConsult}</SubTitle>
          {triLingual('svc_consult', nameLabel)}
          {triLingual('svc_consult_desc', descLabel, true)}
        </div>

        <SectionTitle>{s.textsCatsSection}</SectionTitle>
        <div className="space-y-3">
          {triLingual('cats_title', titleLabel)}
          {triLingual('cats_subtitle', subtitleLabel, true)}
          <SubTitle>{s.textsCatHome}</SubTitle>
          {triLingual('cat_home', nameLabel)}
          {triLingual('cat_home_desc', descLabel, true)}
          <SubTitle>{s.textsCatHp}</SubTitle>
          {triLingual('cat_hp', nameLabel)}
          {triLingual('cat_hp_desc', descLabel, true)}
          <SubTitle>{s.textsCatComm}</SubTitle>
          {triLingual('cat_comm', nameLabel)}
          {triLingual('cat_comm_desc', descLabel, true)}
          <SubTitle>{s.textsCatIhp}</SubTitle>
          {triLingual('cat_ihp', nameLabel)}
          {triLingual('cat_ihp_desc', descLabel, true)}
        </div>

        <div className="pt-6">
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 text-[#0B1929] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {s.textsSaved}
              </>
            ) : saving ? s.saving : s.textsSave}
          </button>
        </div>
      </div>
    </div>
  );
}
