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
    .select('name, title')
    .eq('token', token)
    .eq('is_active', true)
    .single();
  if (!data) return { title: 'AirComfort' };
  return {
    title: `${data.name} — AirComfort`,
    description: `${data.title} · AirComfort`,
    robots: { index: false },
  };
}

const MAPS_URL = 'https://maps.google.com/?q=Katlakalna+iela+8,+Rīga,+LV-1073';

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
  const whatsappUrl = `https://wa.me/${phoneClean.replace(/^\+/, '')}`;

  const initials = data.name
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const iconCircle: React.CSSProperties = {
    width: 52, height: 52, borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const iconCircleWhite: React.CSSProperties = {
    width: 40, height: 40, borderRadius: '50%',
    background: '#f5f5f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  };
  const row: React.CSSProperties = {
    textDecoration: 'none', display: 'flex', alignItems: 'center',
    gap: 16, padding: '18px 24px', borderBottom: '1px solid #f0f0f0',
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>

        {/* Dark header */}
        <div style={{
          background: 'linear-gradient(160deg, #0f2744 0%, #1a1a2e 100%)',
          padding: '48px 24px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          {data.photo_url ? (
            <img src={data.photo_url} alt={data.name} style={{
              width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top',
              border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }} />
          ) : (
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, #27C4A0, #1A6B9A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 700, color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {initials}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: '-0.3px' }}>{data.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 4 }}>{data.title}</p>
          </div>

          {/* Action buttons: CALL / WHATSAPP / EMAIL */}
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <a href={`tel:${phoneClean}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={iconCircle}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, letterSpacing: '0.5px' }}>CALL</span>
            </a>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ ...iconCircle, background: 'rgba(37,211,102,0.2)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, letterSpacing: '0.5px' }}>WHATSAPP</span>
            </a>

            <a href={`mailto:${data.email}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={iconCircle}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, letterSpacing: '0.5px' }}>EMAIL</span>
            </a>
          </div>
        </div>

        {/* White card with details */}
        <div style={{ background: 'white', borderRadius: '20px 20px 0 0', flex: 1, paddingBottom: 100 }}>

          <a href={`tel:${phoneClean}`} style={row}>
            <div style={iconCircleWhite}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 17, fontWeight: 500 }}>{data.phone}</div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>Mobile</div>
            </div>
          </a>

          <a href={`mailto:${data.email}`} style={row}>
            <div style={iconCircleWhite}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 17, fontWeight: 500 }}>{data.email}</div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>Email</div>
            </div>
          </a>

          <div style={{ ...row, borderBottom: '1px solid #f0f0f0' }}>
            <div style={iconCircleWhite}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 17, fontWeight: 500 }}>AirComfort</div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>{data.title}</div>
            </div>
          </div>

          <a href="https://aircomfort.lv" target="_blank" rel="noreferrer" style={row}>
            <div style={iconCircleWhite}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 17, fontWeight: 500 }}>aircomfort.lv</div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>Website</div>
            </div>
          </a>

          {/* Address + Show on map */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 24px' }}>
            <div style={iconCircleWhite}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1a1a1a', fontSize: 16, fontWeight: 500, lineHeight: 1.4 }}>Katlakalna iela 8</div>
              <div style={{ color: '#1a1a1a', fontSize: 16, fontWeight: 500, lineHeight: 1.4 }}>Rīga, LV-1073</div>
              <a href={MAPS_URL} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', marginTop: 6, color: '#e53e3e', fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.2px' }}>
                SHOW ON MAP
              </a>
            </div>
          </div>
        </div>

        {/* Floating add contact button */}
        <a href={vcardUrl} download={`${data.slug}.vcf`}
          style={{
            position: 'fixed', bottom: 32, right: 24,
            width: 60, height: 60, borderRadius: '50%',
            background: '#27C4A0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
