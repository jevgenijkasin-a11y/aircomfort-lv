'use client';

import { useEffect } from 'react';

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

    if (reduced) {
      return () => window.removeEventListener('scroll', onScroll);
    }

    // ── REVEAL ──────────────────────────────────────────────────────────
    const fadeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const delay = el.dataset.stagger ? parseInt(el.dataset.stagger) * 90 : 0;
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          fadeObs.unobserve(el);
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    const initReveal = () => {
      const vh = window.innerHeight;
      document.querySelectorAll('.reveal').forEach((node) => {
        const el = node as HTMLElement;
        const top = el.getBoundingClientRect().top;
        if (top < vh - 10) {
          // already in viewport — show immediately
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.transition = '';
          delete el.dataset.willReveal;
          fadeObs.unobserve(el);
        } else if (!el.dataset.willReveal) {
          // below viewport — hide and observe
          el.style.opacity = '0';
          el.style.transform = 'translateY(18px)';
          el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
          el.dataset.willReveal = '1';
          fadeObs.observe(el);
        }
      });
    };

    initReveal();
    const t1 = setTimeout(initReveal, 200);
    const t2 = setTimeout(initReveal, 600);

    // ── COUNTER ─────────────────────────────────────────────────────────
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el: HTMLElement) => {
      const raw = el.getAttribute('data-count') || '0';
      const suffix = el.getAttribute('data-suffix') || '';
      const target = parseFloat(raw.replace(/[^\d.]/g, ''));
      const isFloat = raw.includes('.');
      el.textContent = (isFloat ? '0.0' : '0') + suffix;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1400, 1);
        const val = easeOut(p) * target;
        el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val).toString()) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target as HTMLElement);
            counterObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-count]').forEach((node) => {
      const el = node as HTMLElement;
      const raw = el.getAttribute('data-count') || '0';
      const suffix = el.getAttribute('data-suffix') || '';
      const isFloat = raw.includes('.');
      el.textContent = (isFloat ? '0.0' : '0') + suffix;
      counterObs.observe(el);
    });

    // ── MAGNETIC BUTTONS ────────────────────────────────────────────────
    const hasMouse = window.matchMedia('(hover: hover)').matches;
    const cleanups: (() => void)[] = [];
    const bound = new WeakSet<HTMLElement>();

    const initMagnetic = () => {
      if (!hasMouse) return;
      document.querySelectorAll('.magnetic').forEach((node) => {
        const el = node as HTMLElement;
        if (bound.has(el)) return;
        bound.add(el);
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
    };

    initMagnetic();
    const t3 = setTimeout(initMagnetic, 500);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      // On cleanup: show all hidden reveals so next mount starts clean
      document.querySelectorAll('.reveal').forEach((node) => {
        const el = node as HTMLElement;
        if (el.dataset.willReveal) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          delete el.dataset.willReveal;
        }
      });
      fadeObs.disconnect();
      counterObs.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
