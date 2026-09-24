'use client';

import { useEffect } from 'react';

/**
 * Site-wide motion, kept deliberately light:
 * - scroll progress bar
 * - reveal-on-scroll for `.reveal` / `.reveal-3d` elements: 350 ms, 12 px
 *   rise, fires as soon as the element enters the bottom 90% of the viewport,
 *   runs ONCE. Elements already on screen at load are never hidden, so the
 *   first screen never shows empty blocks. No motion with prefers-reduced-motion.
 * - subtle magnetic hover on `.magnetic` buttons (mouse devices only)
 */
export default function SiteAnimations() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── SCROLL PROGRESS BAR ─────────────────────────────────────────────
    const bar = document.getElementById('scroll-progress-bar');
    const onScroll = () => {
      if (!bar) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reduced) return () => window.removeEventListener('scroll', onScroll);

    // ── REVEAL (once) ───────────────────────────────────────────────────
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .reveal-3d'));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    els.forEach((el) => {
      // Already visible (or above the fold) → leave it alone, no flash of emptiness
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      const stagger = Math.min(parseInt(el.dataset.stagger || '0', 10) || 0, 5);
      el.style.setProperty('--reveal-delay', `${stagger * 60}ms`);
      el.classList.add('reveal-init');
      obs.observe(el);
    });
    // Safety net: never leave anything hidden (e.g. after fast anchor jumps)
    const safety = setTimeout(() => {
      els.forEach((el) => {
        if (el.classList.contains('reveal-init') && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        }
      });
    }, 1500);

    // ── MAGNETIC BUTTONS ────────────────────────────────────────────────
    const cleanups: (() => void)[] = [];
    if (window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
        el.style.transition = 'transform 0.35s cubic-bezier(0.23,1,0.32,1)';
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 5;
          const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 5;
          el.style.transform = `translate(${dx}px,${dy}px)`;
        };
        const onLeave = () => { el.style.transform = ''; };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          el.removeEventListener('mousemove', onMove);
          el.removeEventListener('mouseleave', onLeave);
        });
      });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(safety);
      obs.disconnect();
      // Leave everything visible so a remount starts clean
      els.forEach((el) => el.classList.add('is-visible'));
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
