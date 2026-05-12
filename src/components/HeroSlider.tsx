'use client';
import { useState, useEffect } from 'react';

const SLIDES = [
  'https://images.unsplash.com/photo-1631545806609-bbb02e574b74?w=1920&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {SLIDES.map((url, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={url} alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
      ))}
      {/* Overlay — keep brand gradient over the photos */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#040f18]/90 via-[#072D47]/80 to-[#0b3d5c]/85" />
      {/* Slide dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SLIDES.map((_, i) => (
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
    </>
  );
}
