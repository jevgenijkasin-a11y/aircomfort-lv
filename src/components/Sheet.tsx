'use client';

// Modal dialog: a bottom sheet on phones (< 768 px), a centred window on
// larger screens. Esc / overlay tap close it, focus moves into the dialog and
// back to the opener, the page underneath does not scroll.
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export default function Sheet({ open, onClose, title, children, footer, closeLabel }: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // First form field (or the panel) gets the focus
    const first = panel.current?.querySelector<HTMLElement>('input:not([type=hidden]):not([type=checkbox]), textarea, select');
    (first ?? panel.current)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); }
      // keep Tab inside the dialog
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'));
        if (!items.length) return;
        const firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey, true);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] sheet-fade" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-panel relative w-full md:max-w-lg max-h-[92dvh] flex flex-col bg-card text-fg border border-line shadow-2xl rounded-t-3xl md:rounded-2xl outline-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* grab handle on phones */}
        <div className="md:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 md:px-6 md:pt-5">
          <h2 id={titleId} className="font-heading font-bold text-xl leading-snug">{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel}
            className="-mr-2 -mt-1 w-11 h-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-muted hover:text-fg hover:bg-fg/5 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 md:px-6">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 md:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
