'use client';

// Single "Contact" floating action button that expands into WhatsApp /
// Telegram / phone. Closes on outside tap and Esc. Hides itself while an
// element marked [data-fab-avoid] (e.g. product price + CTA) sits in the
// bottom strip of the viewport, so it never covers them.
import { useEffect, useRef, useState, useId } from 'react';
import { useLocale } from 'next-intl';

interface Props {
  whatsapp?: string;
  telegram?: string;
  phone?: string;
}

const LBL = {
  contact: { lv: 'Sazināties', ru: 'Связаться', en: 'Contact us' },
  close: { lv: 'Aizvērt', ru: 'Закрыть', en: 'Close' },
  call: { lv: 'Zvanīt', ru: 'Позвонить', en: 'Call' },
};

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z';
const TG_PATH = 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z';

export default function FloatingButtonsClient({ whatsapp, telegram, phone }: Props) {
  const locale = useLocale();
  const l = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';
  const [open, setOpen] = useState(false);
  const [avoid, setAvoid] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on outside tap / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Hide while a [data-fab-avoid] element is inside the bottom 120 px strip
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-fab-avoid]'));
    if (!targets.length) return;
    const visible = new Set<Element>();
    let obs: IntersectionObserver | null = null;
    const setup = () => {
      obs?.disconnect();
      visible.clear();
      obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setAvoid(visible.size > 0);
      }, { rootMargin: `-${Math.max(0, window.innerHeight - 120)}px 0px 0px 0px` });
      targets.forEach((t) => obs!.observe(t));
    };
    setup();
    window.addEventListener('resize', setup);
    return () => { obs?.disconnect(); window.removeEventListener('resize', setup); };
  }, []);

  const items = [
    whatsapp && { href: `https://wa.me/${whatsapp.replace(/^\+/, '')}`, label: 'WhatsApp', bg: 'bg-[#25D366]', path: WA_PATH, external: true },
    telegram && { href: `https://t.me/${telegram}`, label: 'Telegram', bg: 'bg-[#229ED9]', path: TG_PATH, external: true },
    phone && { href: `tel:${phone.replace(/\s/g, '')}`, label: `${LBL.call[l]} ${phone}`, bg: 'bg-[#1A6B9A]', path: null, external: false },
  ].filter(Boolean) as { href: string; label: string; bg: string; path: string | null; external: boolean }[];

  if (!items.length) return null;
  const hidden = avoid && !open;

  return (
    <div
      ref={rootRef}
      className={`fixed right-4 z-50 flex flex-col items-end gap-3 transition-opacity duration-200 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      // Raised above the footer's bottom row so "Privacy policy" stays visible at the page end
      style={{ bottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
    >
      {open && (
        <ul id={menuId} role="menu" aria-label={LBL.contact[l]} className="flex flex-col items-end gap-2.5">
          {items.map((it) => (
            <li key={it.href} role="none">
              <a
                role="menuitem"
                href={it.href}
                {...(it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-[#072D47] border border-white/15 shadow-xl text-sm font-semibold text-white hover:border-[#27C4A0]/60 transition-colors"
              >
                {it.label}
                <span className={`w-10 h-10 rounded-full ${it.bg} flex items-center justify-center`}>
                  {it.path ? (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={it.path} /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? LBL.close[l] : LBL.contact[l]}
        className="h-14 pl-4 pr-5 rounded-full bg-[#27C4A0] hover:bg-[#1fa389] text-[#072D47] font-bold text-sm shadow-lg shadow-black/30 flex items-center gap-2 transition-colors"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
        <span>{open ? LBL.close[l] : LBL.contact[l]}</span>
      </button>
    </div>
  );
}
