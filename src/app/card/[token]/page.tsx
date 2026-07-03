import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const { data } = await supabaseAdmin
    .from('employees_cards')
    .select('name, position')
    .eq('token', token)
    .eq('is_active', true)
    .single();
  if (!data) return { title: 'AirComfort' };
  return {
    title: `${data.name} — AirComfort`,
    description: `${data.position} · AirComfort`,
    robots: { index: false },
  };
}

export default async function CardPage({ params }: Props) {
  const { token } = await params;

  const { data } = await supabaseAdmin
    .from('employees_cards')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (!data) notFound();

  const vcardUrl = `/card/${token}/vcard`;
  const phoneClean = data.phone.replace(/[\s\-()]/g, '');

  const initials = data.name
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>

        {/* Dark header with photo */}
        <div style={{
          background: 'linear-gradient(160deg, #0f2744 0%, #1a1a2e 100%)',
          padding: '48px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Avatar */}
          {data.photo_url ? (
            <img
              src={data.photo_url}
              alt={data.name}
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            />
          ) : (
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #27C4A0, #1A6B9A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {initials}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>{data.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>{data.position}</p>
          </div>

          {/* Action buttons: CALL / EMAIL */}
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <a href={`tel:${phoneClean}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500, letterSpacing: '0.5px' }}>CALL</span>
            </a>

            <a href={`mailto:${data.email}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500, letterSpacing: '0.5px' }}>EMAIL</span>
            </a>
          </div>
        </div>

        {/* White card with details */}
        <div style={{
          background: 'white',
          borderRadius: '20px 20px 0 0',
          flex: 1,
          marginTop: 0,
          paddingBottom: 100,
        }}>
          {/* Phone row */}
          <a href={`tel:${phoneClean}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}>{data.phone}</div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Mobile</div>
            </div>
          </a>

          {/* Email row */}
          <a href={`mailto:${data.email}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}>{data.email}</div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Email</div>
            </div>
          </a>

          {/* Company row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}>AirComfort</div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{data.position}</div>
            </div>
          </div>

          {/* Website row */}
          <a href="https://aircomfort.lv" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}>aircomfort.lv</div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Website</div>
            </div>
          </a>
        </div>

        {/* Floating add contact button */}
        <a
          href={vcardUrl}
          download={`${data.slug}.vcf`}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#27C4A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(39,196,160,0.5)',
            textDecoration: 'none',
          }}
          title="Saglabāt kontaktu / Сохранить контакт"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </a>
      </div>
    </>
  );
}
