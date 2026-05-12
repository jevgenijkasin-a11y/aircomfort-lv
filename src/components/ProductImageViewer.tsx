'use client';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  brandColor: string;
  brand: string;
}

export default function ProductImageViewer({ src, alt, brandColor, brand }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="h-80 flex items-center justify-center relative cursor-zoom-in"
        style={{ background: `linear-gradient(135deg, ${brandColor}25, ${brandColor}08)` }}
        onClick={() => src && setOpen(true)}
        title={src ? 'Нажмите для увеличения' : undefined}
      >
        <div className="absolute inset-0 opacity-15"
          style={{ background: `radial-gradient(circle at 60% 40%, ${brandColor}, transparent 70%)` }} />
        {src ? (
          <>
            <img src={src} alt={alt} className="relative h-full w-full object-contain p-8" />
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5 text-white/60 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              увеличить
            </div>
          </>
        ) : (
          <div className="relative flex flex-col items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-3xl font-bold opacity-50" style={{ color: brandColor }}>{brand}</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
