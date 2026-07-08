'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
      // Ensure 3D-reveal elements are visible when motion is reduced
      document.querySelectorAll('.reveal-3d').forEach((n) => (n as HTMLElement).classList.add('is-revealed'));
      return () => window.removeEventListener('scroll', onScroll);
    }

    // ── REVEAL 3D (GSAP ScrollTrigger — depth reveal like the landing) ───
    // GSAP animates the wrapper only; the inner card keeps its :hover.
    const reveal3d = gsap.utils.toArray<HTMLElement>('.reveal-3d');
    const revealTriggers: ScrollTrigger[] = [];
    if (reveal3d.length) {
      gsap.set(reveal3d, { opacity: 0, y: 55, rotateX: 18 });
      const st = ScrollTrigger.batch(reveal3d, {
        start: 'top 85%',
        onEnter: (batch) => {
          batch.forEach((el) => (el as HTMLElement).classList.add('revealing'));
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.11,
            ease: 'power2.out',
            overwrite: true,
            onComplete: () => batch.forEach((el) => (el as HTMLElement).classList.remove('revealing')),
          });
        },
      });
      revealTriggers.push(...st);
      // Recalculate positions after fonts/images settle so triggers fire correctly
      const rt1 = setTimeout(() => ScrollTrigger.refresh(), 300);
      const rt2 = setTimeout(() => ScrollTrigger.refresh(), 900);
      revealTriggers.push({ kill: () => { clearTimeout(rt1); clearTimeout(rt2); } } as unknown as ScrollTrigger);
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
      revealTriggers.forEach((st) => st.kill());
      // Reset reveal wrappers to visible so a remount starts clean
      gsap.set('.reveal-3d', { clearProps: 'all' });
      document.querySelectorAll('.reveal-3d').forEach((n) => (n as HTMLElement).classList.add('is-revealed'));
      fadeObs.disconnect();
      counterObs.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
