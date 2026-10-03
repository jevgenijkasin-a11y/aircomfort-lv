'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const start = window.scrollY;
    const duration = 600;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start * (1 - ease(progress)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      // Bottom-left on every screen; on phones at the same height as the contact FAB (bottom-right)
      style={{ bottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
      className="fixed left-4 lg:left-6 z-50 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-card hover:bg-primary border border-line hover:border-accent text-fg hover:text-on-primary shadow-lg backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
