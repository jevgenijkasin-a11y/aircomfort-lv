'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';

interface Props {
  images: string[];
  alt: string;
  brandColor: string;
  brand: string;
}

export default function ProductImageViewer({ images, alt, brandColor, brand }: Props) {
  const t = useTranslations('products');
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const prev = useCallback(() => setLbIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setLbIndex(i => (i + 1) % images.length), [images.length]);

  const openLightbox = (i: number) => { setLbIndex(i); setLightbox(true); };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  return (
    <>
      {/* Main image */}
      <div
        className="h-80 flex items-center justify-center relative cursor-zoom-in select-none bg-white"
        onClick={() => hasImages && openLightbox(active)}
      >

        {hasImages ? (
          <>
            <img src={images[active]} alt={alt} className="relative h-full w-full object-contain p-8" />

            {hasMultiple && (
              <>
                <button
                  aria-label={t('prevImage')}
                  onClick={(e) => { e.stopPropagation(); setActive(i => (i - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/15 hover:bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 transition-colors z-10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  aria-label={t('nextImage')}
                  onClick={(e) => { e.stopPropagation(); setActive(i => (i + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/15 hover:bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 transition-colors z-10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            <div className="absolute bottom-3 right-3 bg-black/15 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5 text-gray-600 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              {hasMultiple ? `${active + 1} / ${images.length}` : t('enlarge')}
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

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin">
          {images.map((src, i) => (
            <button
              key={i}
              aria-label={`${alt} ${i + 1}`}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-white ${
                active === i
                  ? 'border-[#27C4A0] opacity-100'
                  : 'border-gray-200 opacity-60 hover:opacity-90 hover:border-gray-400'
              }`}
            >
              <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — rendered via portal to escape parent stacking contexts */}
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            aria-label={t('close')}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {hasMultiple && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white/50 text-sm">
              {lbIndex + 1} / {images.length}
            </div>
          )}

          <div className="relative flex items-center justify-center max-w-5xl w-full h-[72vh]" onClick={(e) => e.stopPropagation()}>
            {hasMultiple && (
              <button
                aria-label={t('prevImage')}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute -left-2 sm:left-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0 z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl mx-4 overflow-hidden">
              <img
                src={images[lbIndex]}
                alt={`${alt} ${lbIndex + 1}`}
                className="max-w-full max-h-full object-contain p-6"
              />
            </div>
            {hasMultiple && (
              <button
                aria-label={t('nextImage')}
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute -right-2 sm:right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0 z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>

          {hasMultiple && (
            <div className="flex gap-2 mt-5 overflow-x-auto max-w-lg px-4" onClick={(e) => e.stopPropagation()}>
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLbIndex(i); }}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    lbIndex === i ? 'border-[#27C4A0]' : 'border-white/15 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
