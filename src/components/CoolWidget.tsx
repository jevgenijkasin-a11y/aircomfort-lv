'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string; // i18n string passed from server Hero
}

const FROM_TEMP = 32;
const TO_TEMP = 22;
const DURATION = 2500;

// warm→cool color interpolation. Dark theme: #FF8C42 → #27C4A0 (as before).
// Light theme: the --heat → --primary tokens, which stay readable on white.
const RAMP = { dark: [[0xff, 0x8c, 0x42], [0x27, 0xc4, 0xa0]], light: [[0xc2, 0x51, 0x1c], [0x0b, 0x7a, 0x63]] } as const;
function lerpColor(t: number, dark = true) {
  const [a, b] = dark ? RAMP.dark : RAMP.light;
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Follows the site theme (html[data-theme]) including live switches. */
function useDarkTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setDark(html.getAttribute('data-theme') === 'dark');
    read();
    const mo = new MutationObserver(read);
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export default function CoolWidget({ label }: Props) {
  const [temp, setTemp] = useState(FROM_TEMP);
  const [progress, setProgress] = useState(0);
  const [fired, setFired] = useState(false);
  const dark = useDarkTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          setFired(true);
          obs.disconnect();
          const start = performance.now();
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
          const tick = (now: number) => {
            const p = Math.min((now - start) / DURATION, 1);
            const e = easeOut(p);
            setTemp(Math.round(FROM_TEMP - e * (FROM_TEMP - TO_TEMP)));
            setProgress(e);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.8 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fired]);

  const color = lerpColor(progress, dark);
  // teal glow is halved on the light theme
  const glowAlpha = (0.3 + progress * 0.4) * (dark ? 1 : 0.5);
  const glow = `0 0 ${Math.round(8 + progress * 16)}px ${color.replace('rgb', 'rgba').replace(')', `,${glowAlpha})`)}`;

  const fadeOut = Math.max(0, 1 - progress * 1.5); // fades out by ~67% progress

  return (
    <div ref={ref} className="flex flex-col items-center sm:items-start">
      <div className="flex items-baseline">
        <span
          className="font-heading font-bold text-2xl overflow-hidden whitespace-nowrap"
          style={{
            color: lerpColor(0, dark),
            opacity: fadeOut,
            maxWidth: `${fadeOut * 3.5}rem`,
            transition: 'none',
          }}
          suppressHydrationWarning
        >
          +{FROM_TEMP}°
        </span>
        <span
          className="font-heading font-bold text-base overflow-hidden whitespace-nowrap text-muted"
          style={{
            opacity: fadeOut,
            maxWidth: `${fadeOut * 1.5}rem`,
            transition: 'none',
          }}
        >
          &nbsp;→&nbsp;
        </span>
        <span
          className="font-heading font-bold text-3xl transition-none"
          style={{ color, textShadow: glow }}
          suppressHydrationWarning
        >
          +{temp}°
        </span>
      </div>
      <span className="text-sm text-muted mt-0.5">{label}</span>
    </div>
  );
}
