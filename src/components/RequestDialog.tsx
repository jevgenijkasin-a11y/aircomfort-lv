'use client';

// Request form in a sheet: "Order" from a product card / comparison, or
// "Send the selection" from favourites. Goes to /api/contact like the
// contact form — the server attaches product names and prices from the DB.
import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import Sheet from '@/components/Sheet';

export type RequestProduct = { id: string; name: string; price: number; image: string | null };

const inputCls = 'w-full bg-surface border border-line text-fg text-base px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-colors placeholder:text-muted/70';

export default function RequestDialog({ mode, products, onClose }: {
  mode: 'order' | 'favorites';
  products: RequestProduct[];
  onClose: () => void;
}) {
  const t = useTranslations('shop');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+371 ');
  const [comment, setComment] = useState('');
  const [install, setInstall] = useState(true);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [touched, setTouched] = useState(false);

  const nameErr = touched && !name.trim();
  const phoneErr = touched && phone.replace(/\D/g, '').length < 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || phone.replace(/\D/g, '').length < 6) return;
    setStatus('sending');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, message: comment, locale,
          service: mode === 'order' ? 'catalog_order' : 'favorites',
          product_ids: products.map((p) => p.id),
          ...(mode === 'order' ? { install } : {}),
        }),
      });
      setStatus(r.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const price = (p: RequestProduct) => (p.price ? `${p.price.toLocaleString('lv-LV')} €` : t('priceOnRequest'));
  const title = mode === 'order' ? t('orderTitle') : t('favSendTitle');

  return (
    <Sheet open onClose={onClose} title={title} closeLabel={t('close')}>
      {status === 'done' ? (
        <div className="py-6 text-center" role="status">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-tint text-primary flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="font-heading font-semibold text-lg mb-6">{t('thanks')}</p>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold transition-colors">{t('close')}</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {/* What is being ordered */}
          {mode === 'order' ? (
            products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-surface border border-line p-3">
                <div data-theme="light" className="relative w-16 h-16 flex-shrink-0 rounded-lg bg-photo overflow-hidden">
                  {p.image && <Image src={p.image} alt="" fill sizes="64px" className="object-contain p-1.5 mix-blend-multiply" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-snug line-clamp-2">{p.name}</p>
                  <p className="font-heading font-bold text-primary mt-0.5">{price(p)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-surface border border-line p-3">
              <p className="text-sm text-muted mb-2">{t('favSendHint', { n: products.length })}</p>
              <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
                {products.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3"><span className="truncate">{p.name}</span><span className="text-muted whitespace-nowrap">{price(p)}</span></li>
                ))}
              </ul>
            </div>
          )}
          {mode === 'order' && <p className="text-sm text-muted">{t('orderHint')}</p>}

          <div>
            <label htmlFor="rq-name" className="block text-sm font-medium text-muted mb-1.5">{t('name')} *</label>
            <input id="rq-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={nameErr} aria-describedby={nameErr ? 'rq-name-err' : undefined} />
            {nameErr && <p id="rq-name-err" className="mt-1 text-sm text-heat">{t('needName')}</p>}
          </div>
          <div>
            <label htmlFor="rq-phone" className="block text-sm font-medium text-muted mb-1.5">{t('phone')} *</label>
            <input id="rq-phone" type="tel" inputMode="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-invalid={phoneErr} aria-describedby={phoneErr ? 'rq-phone-err' : undefined} />
            {phoneErr && <p id="rq-phone-err" className="mt-1 text-sm text-heat">{t('needPhone')}</p>}
          </div>
          <div>
            <label htmlFor="rq-comment" className="block text-sm font-medium text-muted mb-1.5">{t('comment')}</label>
            <textarea id="rq-comment" rows={2} className={`${inputCls} resize-y`} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('commentPh')} />
          </div>
          {mode === 'order' && (
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer select-none">
              <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} className="w-5 h-5 accent-[rgb(var(--primary))]" />
              <span className="font-medium">{t('install')}</span>
            </label>
          )}
          {status === 'error' && <p className="text-sm text-heat" role="alert">{t('error')}</p>}
          <button type="submit" disabled={status === 'sending'}
            className="w-full min-h-[48px] rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-on-primary font-bold text-base transition-colors">
            {status === 'sending' ? t('sending') : t('send')}
          </button>
        </form>
      )}
    </Sheet>
  );
}
