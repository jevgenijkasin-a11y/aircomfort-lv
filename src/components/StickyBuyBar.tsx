'use client';

// Product page on phones (< 768 px): a bar fixed to the bottom of the screen
// with the price, "total with installation" and the Order button. It shows
// once the page's own price blocks (#price-top, #buy-box) have left the screen
// and hides again while one of them — or the footer — is visible.
// While it is shown it publishes its height as --buybar-h on <html>, so the
// contact button moves above it; <html data-product-page> makes the contact
// button smaller and hides "scroll to top" on phones (see globals.css).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import OrderLink from '@/components/OrderLink';

export default function StickyBuyBar({ price, total, orderLabel, service, message }: {
  price: ReactNode;
  /** "Kopā ar montāžu no … €" — only when the product has a price */
  total?: ReactNode;
  orderLabel: string;
  service: string;
  message: string;
}) {
  const [show, setShow] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-product-page', '');
    const watched = ['price-top', 'buy-box'].map((id) => document.getElementById(id)).filter(Boolean) as Element[];
    const footer = document.querySelector('footer');
    if (footer) watched.push(footer);
    const visible = new Set<Element>();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      // Only phones: the desktop layout keeps the price next to the photo
      setShow(visible.size === 0 && window.innerWidth < 768);
    });
    watched.forEach((el) => obs.observe(el));
    return () => { obs.disconnect(); root.removeAttribute('data-product-page'); };
  }, []);

  // Height for the contact button offset (0 while hidden)
  useEffect(() => {
    const root = document.documentElement;
    if (!show || !bar.current) { root.style.removeProperty('--buybar-h'); return; }
    const el = bar.current;
    const apply = () => root.style.setProperty('--buybar-h', `${el.offsetHeight}px`);
    apply();
    root.style.setProperty('--fab-gap', '0.75rem');
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty('--buybar-h'); root.style.removeProperty('--fab-gap'); };
  }, [show]);

  return (
    <div ref={bar} aria-hidden={!show}
      className={`md:hidden fixed inset-x-0 z-40 border-t border-line bg-card/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-200 ${show ? 'translate-y-0' : 'translate-y-[120%] pointer-events-none'}`}
      // Above the comparison bar when that one is open too; safe area for the iPhone home indicator
      style={{ bottom: 'var(--compare-bar-h, 0px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="font-heading font-bold text-lg leading-tight text-fg">{price}</div>
          {total && <div className="text-xs text-muted leading-snug truncate">{total}</div>}
        </div>
        <OrderLink service={service} message={message} {...(show ? {} : { tabIndex: -1 })}
          className="flex-shrink-0 inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm transition-colors">
          {orderLabel}
        </OrderLink>
      </div>
    </div>
  );
}
