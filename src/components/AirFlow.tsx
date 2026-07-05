'use client';

import { useEffect, useRef } from 'react';

const STREAMS = [
  { d: 'M-100,200 C150,180 300,220 600,190 S900,160 1200,195 S1500,210 1700,185', dur: 8,  delay: 0, opacity: 0.18 },
  { d: 'M-80,380  C180,350 350,400 650,365 S950,330 1250,370 S1520,390 1720,355', dur: 11, delay: 2, opacity: 0.14 },
  { d: 'M-60,520  C200,490 380,545 680,510 S980,475 1280,515 S1540,535 1740,500', dur: 9,  delay: 4, opacity: 0.20 },
  { d: 'M-120,650 C160,625 330,670 630,640 S930,610 1230,645 S1510,660 1720,630', dur: 13, delay: 1, opacity: 0.13 },
  { d: 'M-90,760  C170,740 340,780 640,755 S940,730 1240,760 S1510,775 1730,745', dur: 10, delay: 3, opacity: 0.16 },
] as const;

export default function AirFlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse  = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarse || !ref.current) return;

    const el = ref.current;
    let rafId = 0;
    let tx = 0, ty = 0;
    let tx0 = 0, ty0 = 0;

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      tx0 = (e.clientX - cx) / cx * 50;
      ty0 = (e.clientY - cy) / cy * 25;
    };

    const tick = () => {
      tx += (tx0 - tx) * 0.06;
      ty += (ty0 - ty) * 0.06;
      el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="airflow-layer absolute inset-0 pointer-events-none z-10 hidden sm:block"
      style={{ willChange: 'transform' }}
      suppressHydrationWarning
    >
      <svg
        viewBox="0 0 1600 900"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {STREAMS.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill="none"
            stroke="#27C4A0"
            strokeWidth="2"
            opacity={s.opacity}
            style={{
              animation: `airflow-drift ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
