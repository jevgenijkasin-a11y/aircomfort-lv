'use client';

// UI kit for /admin-v2 — markup/styles ported from TailAdmin (MIT, see LICENSE-TailAdmin.txt).
import { useCallback, useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { IconX, IconLeft, IconRight } from './icons';

// ── Button ─────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 dark:disabled:bg-brand-800',
  outline: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03]',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
  danger: 'bg-error-500 text-white shadow-theme-xs hover:bg-error-600',
};
export function Button({
  variant = 'primary', size = 'md', className = '', children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm';
  return (
    <button type="button" {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${sz} ${BTN[variant]} ${className}`}>
      {children}
    </button>
  );
}

/** Square icon button with an accessible label. */
export function IconButton({ label, className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" title={label} aria-label={label} {...rest}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white ${className}`}>
      {children}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────
type BadgeColor = 'success' | 'error' | 'warning' | 'brand' | 'gray' | 'info';
const BADGE: Record<BadgeColor, string> = {
  success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
  error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
  brand: 'bg-brand-50 text-brand-600 dark:bg-accent/15 dark:text-accent',
  gray: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
};
export const Badge = ({ color = 'gray', children }: { color?: BadgeColor; children: ReactNode }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${BADGE[color]}`}>{children}</span>
);

// ── Card / page header / empty state ───────────────────────────────────
export function Card({ title, desc, actions, children, className = '' }: { title?: ReactNode; desc?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {desc && <p className="mt-0.5 text-theme-sm text-gray-500 dark:text-gray-400">{desc}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export const PageHeader = ({ title, desc, actions }: { title: ReactNode; desc?: ReactNode; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h2>
      {desc && <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">{desc}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const EmptyState = ({ title, desc, icon }: { title: string; desc?: string; icon?: ReactNode }) => (
  <div className="py-16 text-center">
    {icon && <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5">{icon}</div>}
    <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
    {desc && <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">{desc}</p>}
  </div>
);

export const Spinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <span className={`${className} inline-block animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500`} role="status" aria-label="loading" />
);

// ── Form fields ────────────────────────────────────────────────────────
export const Field = ({ label, hint, error, children, className = '' }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode; className?: string }) => (
  <div className={className}>
    {label && <label className="field-label">{label}</label>}
    {children}
    {hint && <p className="field-hint">{hint}</p>}
    {error && <p className="field-error">{error}</p>}
  </div>
);

export function Toggle({ checked, onChange, label, color = 'brand' }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; color?: 'brand' | 'orange' | 'pink' }) {
  const on = color === 'orange' ? 'bg-orange-500' : color === 'pink' ? 'bg-pink-600' : 'bg-brand-500';
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-3">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${checked ? on : 'bg-gray-200 dark:bg-white/10'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-theme-sm transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {label && <span className="text-theme-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
}

// ── Modal / drawer / confirm ───────────────────────────────────────────
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useEscape(open, onClose);
  if (!open) return null;
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-6xl' }[size];
  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative flex max-h-[94vh] w-full ${w} flex-col rounded-3xl bg-white shadow-theme-xl dark:bg-gray-900`}>
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
          <IconButton label="✕" onClick={onClose}><IconX /></IconButton>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-99999" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-theme-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
          <IconButton label="✕" onClick={onClose}><IconX /></IconButton>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">{footer}</div>}
      </aside>
    </div>
  );
}

export function Confirm({ open, title, text, confirmLabel, cancelLabel, onConfirm, onCancel, busy, error }: {
  open: boolean; title: ReactNode; text?: ReactNode; confirmLabel: string; cancelLabel: string;
  onConfirm: () => void; onCancel: () => void; busy?: boolean; error?: string | null;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm"
      footer={<>
        <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button>
      </>}>
      {text && <p className="text-theme-sm text-gray-600 dark:text-gray-400">{text}</p>}
      {error && <p className="mt-3 rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">{error}</p>}
    </Modal>
  );
}

// ── Dropdown ───────────────────────────────────────────────────────────
export function Dropdown({ trigger, children, align = 'right' }: { trigger: (open: boolean) => ReactNode; children: ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div className={`absolute z-999 mt-2 min-w-[200px] rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPage, labels }: { page: number; pages: number; onPage: (p: number) => void; labels: { prev: string; next: string } }) {
  if (pages <= 1) return null;
  const nums: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  const cls = 'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-theme-sm font-medium';
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button type="button" className={`${cls} text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/5`} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={labels.prev}><IconLeft className="h-4 w-4" /></button>
      {nums.map((n, i) => n === '…'
        ? <span key={`e${i}`} className="px-1 text-gray-400">…</span>
        : <button key={n} type="button" onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}
            className={`${cls} ${n === page ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/5'}`}>{n}</button>)}
      <button type="button" className={`${cls} text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/5`} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={labels.next}><IconRight className="h-4 w-4" /></button>
    </nav>
  );
}

// ── Toast (single message, auto-hide) ──────────────────────────────────
export function useToast() {
  const [msg, setMsg] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), 3000); return () => clearTimeout(id); }, [msg]);
  const node = msg && (
    <div className={`fixed bottom-6 right-6 z-99999 rounded-xl px-4 py-3 text-theme-sm font-medium shadow-theme-lg ${msg.kind === 'ok' ? 'bg-brand-500 text-white' : 'bg-error-500 text-white'}`} role="status">
      {msg.text}
    </div>
  );
  const toast = useCallback((text: string, kind: 'ok' | 'err' = 'ok') => setMsg({ text, kind }), []);
  return { toast, toastNode: node };
}
