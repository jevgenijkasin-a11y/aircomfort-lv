'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string; // i18n string passed from server Hero
}

const FROM_TEMP = 32;
const TO_TEMP = 22;
const DURATION = 2500;

// warm→cool color interpolation
function lerpColor(t: number) {
  // #FF8C42 → #27C4A0
  const r = Math.round(0xff + (0x27 - 0xff) * t);
  const g = Math.round(0x8c + (0xc4 - 0x8c) * t);
  const b = Math.round(0x42 + (0xa0 - 0x42) * t);
  return `rgb(${r},${g},${b})`;
}

export default function CoolWidget({ label }: Props) {
  const [temp, setTemp] = useState(FROM_TEMP);
  const [progress, setProgress] = useState(0);
  const [fired, setFired] = useState(false);
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

  const color = lerpColor(progress);
  const glow = `0 0 ${Math.round(8 + progress * 16)}px ${color.replace('rgb', 'rgba').replace(')', `,${0.3 + progress * 0.4})`)}`;

  const fadeOut = Math.max(0, 1 - progress * 1.5); // fades out by ~67% progress

  return (
    <div ref={ref} className="flex flex-col">
      <div className="flex items-baseline">
        <span
          className="font-syne font-bold text-2xl overflow-hidden whitespace-nowrap"
          style={{
            color: lerpColor(0),
            opacity: fadeOut,
            maxWidth: `${fadeOut * 3.5}rem`,
            transition: 'none',
          }}
          suppressHydrationWarning
        >
          +{FROM_TEMP}°
        </span>
        <span
          className="font-syne font-bold text-base overflow-hidden whitespace-nowrap"
          style={{
            color: 'rgba(255,255,255,0.4)',
            opacity: fadeOut,
            maxWidth: `${fadeOut * 1.5}rem`,
            transition: 'none',
          }}
        >
          &nbsp;→&nbsp;
        </span>
        <span
          className="font-syne font-bold text-3xl transition-none"
          style={{ color, textShadow: glow }}
          suppressHydrationWarning
        >
          +{temp}°
        </span>
      </div>
      <span className="text-sm text-white/45 mt-0.5">{label}</span>
    </div>
  );
}
