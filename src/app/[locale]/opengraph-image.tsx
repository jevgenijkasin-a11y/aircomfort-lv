// Branded Open Graph card (1200x630) shown when the site is shared in
// WhatsApp / Telegram / social networks. Rendered by Next.js at request time.
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AirComfort — kondicionētāji Latvijā';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TAGLINES: Record<string, string> = {
  lv: 'Kondicionētāju pārdošana un profesionāla uzstādīšana Latvijā',
  ru: 'Продажа и профессиональная установка кондиционеров в Латвии',
  en: 'Air conditioner sales & professional installation in Latvia',
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tagline = TAGLINES[locale] ?? TAGLINES.lv;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #051e31 0%, #0A3658 100%)',
        }}
      >
        {/* soft teal glow */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: 'rgba(39,196,160,0.14)',
            filter: 'blur(40px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -220,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: 'rgba(26,107,154,0.20)',
            filter: 'blur(40px)',
            display: 'flex',
          }}
        />

        {/* logo mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #27C4A0, #1A6B9A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 40px rgba(39,196,160,0.35)',
            }}
          >
            <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="white" strokeWidth="1.8">
              <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
            <span style={{ color: 'white' }}>Air</span>
            <span style={{ color: '#27C4A0' }}>Comfort</span>
          </div>
        </div>

        {/* tagline */}
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 32,
            color: 'rgba(255,255,255,0.72)',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>

        {/* divider + site url */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginTop: 48,
          }}
        >
          <div style={{ display: 'flex', width: 60, height: 2, background: 'rgba(39,196,160,0.55)' }} />
          <div style={{ display: 'flex', fontSize: 28, color: '#27C4A0', fontWeight: 600, letterSpacing: 2 }}>
            aircomfort.lv
          </div>
          <div style={{ display: 'flex', width: 60, height: 2, background: 'rgba(39,196,160,0.55)' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
