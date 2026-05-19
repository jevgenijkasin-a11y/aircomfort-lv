'use client';
import { useState, useEffect } from 'react';

interface Props {
  slides: string[];
}

export default function HeroSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <>
      {slides.map((url, i) => (
        <div
          key={url + i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden
            style={{ filter: 'brightness(1.05) saturate(0.88) contrast(0.96)' }}
          />
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-[#27C4A0] w-8' : 'bg-white/30 hover:bg-white/60 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
