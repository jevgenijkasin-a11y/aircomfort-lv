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
    const revealTimeouts: ReturnType<typeof setTimeout>[] = [];
    if (reveal3d.length) {
      const shown = new WeakSet<HTMLElement>();

      const showCards = (cards: HTMLElement[], animate: boolean) => {
        const todo = cards.filter((el) => !shown.has(el));
        if (!todo.length) return;
        todo.forEach((el) => shown.add(el));
        if (animate) {
          todo.forEach((el) => el.classList.add('revealing'));
          gsap.to(todo, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.11,
            ease: 'power2.out',
            overwrite: true,
            onComplete: () => todo.forEach((el) => el.classList.remove('revealing')),
          });
        } else {
          // No animation — just make them visible (fallback path)
          gsap.set(todo, { opacity: 1, y: 0, rotateX: 0 });
        }
      };

      // When cards drop back out of view below the viewport (user scrolled
      // up), reset them so the reveal replays on the next scroll down.
      const resetCards = (cards: HTMLElement[]) => {
        cards.forEach((el) => {
          shown.delete(el);
          el.classList.remove('revealing');
        });
        gsap.set(cards, { opacity: 0, y: 55, rotateX: 18, overwrite: true });
      };

      reveal3d.forEach((el) => el.classList.add('reveal-init'));
      gsap.set(reveal3d, { opacity: 0, y: 55, rotateX: 18 });

      // Cards already in the viewport on load: reveal them right away, so a
      // section that never crosses the trigger line can't stay blank.
      const vh = window.innerHeight;
      const inView = reveal3d.filter((el) => {
        const top = el.getBoundingClientRect().top;
        return top < vh && top > -el.offsetHeight;
      });
      if (inView.length) showCards(inView, true);

      // Animate on every pass in BOTH directions:
      // - onEnter: entering from below while scrolling down
      // - onLeave: fully exited above -> reset so the return replays
      // - onEnterBack: re-entering from above while scrolling up
      const st = ScrollTrigger.batch(reveal3d, {
        start: 'top 88%',
        end: 'bottom top',
        onEnter: (batch) => showCards(batch as HTMLElement[], true),
        onLeave: (batch) => resetCards(batch as HTMLElement[]),
        onEnterBack: (batch) => showCards(batch as HTMLElement[], true),
      });
      revealTriggers.push(...st);

      // Replay: reset a card only when it is COMPLETELY below the viewport
      // (user scrolled back up past it), so it never blinks out while still
      // visible. Next scroll down re-fires the batch onEnter.
      const resetObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting && e.boundingClientRect.top >= window.innerHeight) {
              resetCards([e.target as HTMLElement]);
            }
          });
        },
        { threshold: 0 }
      );
      reveal3d.forEach((el) => resetObs.observe(el));
      revealTriggers.push({ kill: () => resetObs.disconnect() } as unknown as ScrollTrigger);

      // Recalculate after fonts/images settle so triggers fire correctly.
      revealTimeouts.push(setTimeout(() => ScrollTrigger.refresh(), 300));
      revealTimeouts.push(setTimeout(() => ScrollTrigger.refresh(), 1000));

      // Safety net: after 1.8s force-show any card that is in (or near) the
      // viewport but still hidden — guarantees no permanently-blank section.
      revealTimeouts.push(
        setTimeout(() => {
          const near = reveal3d.filter((el) => {
            if (shown.has(el)) return false;
            const top = el.getBoundingClientRect().top;
            return top < window.innerHeight + 300;
          });
          if (near.length) showCards(near, false);
        }, 1800)
      );
    }

    // ── REVEAL ──────────────────────────────────────────────────────────
    const fadeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            const delay = el.dataset.stagger ? parseInt(el.dataset.stagger) * 90 : 0;
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, delay);
          } else if (
            e.boundingClientRect.top >= window.innerHeight ||
            e.boundingClientRect.bottom <= 0
          ) {
            // Completely out of view (below OR above the viewport) — reset
            // so the reveal replays on the next entrance from either side.
            el.style.opacity = '0';
            el.style.transform = 'translateY(18px)';
          }
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

    // Guard so a counter doesn't restart while it's visible; the guard is
    // cleared when it fully leaves the viewport, so it re-counts on return.
    const ranCounters = new WeakSet<HTMLElement>();
    const runCounter = (el: HTMLElement) => {
      if (ranCounters.has(el)) return;
      ranCounters.add(el);
      animateCounter(el);
    };

    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            runCounter(el);
          } else {
            ranCounters.delete(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    const counterEls: HTMLElement[] = [];
    document.querySelectorAll('[data-count]').forEach((node) => {
      const el = node as HTMLElement;
      const raw = el.getAttribute('data-count') || '0';
      const suffix = el.getAttribute('data-suffix') || '';
      const isFloat = raw.includes('.');
      el.textContent = (isFloat ? '0.0' : '0') + suffix;
      counterEls.push(el);
      // Already on screen (e.g. hero stats): run immediately so it can't
      // get stuck at 0 when the observer's first callback never flips.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        runCounter(el);
      }
      // Keep observing regardless, so the counter replays on re-entry.
      counterObs.observe(el);
    });
    // Safety net: any counter still at 0 after 1.2s gets forced to run.
    const counterFallback = setTimeout(() => {
      counterEls.forEach((el) => {
        if (!ranCounters.has(el) && el.getBoundingClientRect().top < window.innerHeight + 200) {
          runCounter(el);
        }
      });
    }, 1200);

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
      clearTimeout(counterFallback);
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
      revealTimeouts.forEach((id) => clearTimeout(id));
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
