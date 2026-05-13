'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm({ formTitle }: { formTitle?: string }) {
  const t = useTranslations('contacts.form');
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setStatus('sending');
    const { error } = await supabase.from('contacts').insert([{
      name: form.name,
      phone: form.phone,
      email: form.email,
      service: form.service,
      message: form.message,
      status: 'new',
    }]);
    setStatus(error ? 'error' : 'success');
  };

  const inputCls = 'w-full bg-[#0A3658]/60 border border-[#1A6B9A]/30 hover:border-[#1A6B9A]/50 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#27C4A0]/60 transition-all placeholder-white/20';
  const labelCls = 'block text-sm font-medium text-white/55 mb-1.5';

  if (status === 'success') {
    return (
      <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#27C4A0]/15 border border-[#27C4A0]/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#27C4A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-syne font-semibold text-xl">{t('success')}</p>
        <button onClick={() => { setStatus('idle'); setForm({ name: '', phone: '', email: '', service: '', message: '' }); }}
          className="text-[#27C4A0] text-sm hover:text-white transition-colors mt-2">
          ←
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7 space-y-5">
      <h3 className="font-syne font-semibold text-xl mb-2">{formTitle || t('title')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>{t('name')}</label>
          <input type="text" value={form.name} onChange={set('name')} placeholder={t('namePlaceholder')} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('phone')}</label>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder={t('phonePlaceholder')} required className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>{t('email')}</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder={t('emailPlaceholder')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('service')}</label>
          <div className="relative">
            <select value={form.service} onChange={set('service')} className={`${inputCls} appearance-none`} style={{ background: '#0A3658' }}>
              <option value="">{t('servicePlaceholder')}</option>
              <option value="install">{t('serviceInstall')}</option>
              <option value="maintenance">{t('serviceMaintenance')}</option>
              <option value="consultation">{t('serviceConsultation')}</option>
              <option value="other">{t('serviceOther')}</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>{t('message')}</label>
        <textarea value={form.message} onChange={set('message')} placeholder={t('messagePlaceholder')} rows={4} className={`${inputCls} resize-none`} />
      </div>

      {status === 'error' && <p className="text-red-400 text-sm">{t('error')}</p>}

      <button type="submit" disabled={status === 'sending' || !form.name || !form.phone}
        className="w-full bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 disabled:cursor-not-allowed text-[#072D47] font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#27C4A0]/20 text-base flex items-center justify-center gap-2">
        {status === 'sending' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('sending')}
          </>
        ) : (
          <>
            {t('submit')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
