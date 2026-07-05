'use client';

const brands = ['Daikin', 'Mitsubishi', 'LG', 'TCL', 'Midea', 'Nordis', 'Hisense', 'Toshiba', 'HAVA'];

export default function BrandMarquee() {
  // 4 copies — translateX(-25%) loops seamlessly regardless of viewport width
  const quad = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="py-14 border-y border-[#1A6B9A]/15 overflow-hidden">
      {/* prefers-reduced-motion: static grid */}
      <div className="motion-reduce-show max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {brands.map((b) => (
            <span key={b} className="font-syne font-bold text-xl text-white/20 tracking-wide">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* normal: marquee */}
      <div className="motion-ok-show marquee-track group" aria-hidden="true">
        <div className="marquee-inner group-hover:[animation-play-state:paused]">
          {quad.map((b, i) => (
            <span
              key={i}
              className="font-syne font-bold text-xl text-white/25 hover:text-white/70 transition-colors duration-200 tracking-wide cursor-default select-none px-10"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .motion-reduce-show { display: none; }
          .motion-ok-show { display: block; }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce-show { display: block; }
          .motion-ok-show { display: none; }
        }

        .marquee-track {
          width: 100%;
          overflow: hidden;
        }

        .marquee-inner {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marquee-scroll 30s linear infinite;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }
        }
      `}</style>
    </section>
  );
}
