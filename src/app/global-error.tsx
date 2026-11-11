'use client';

// Last resort when the root layout itself fails: no translations or theme are
// available here, so the page is self-contained.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#0b1220', color: '#e6edf3', minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
        <div>
          <p style={{ fontSize: 56, fontWeight: 800, color: '#27C4A0', margin: '0 0 8px' }}>500</p>
          <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Kaut kas nogāja greizi / Что-то пошло не так</h1>
          <p style={{ color: '#9fb0c3', margin: '0 0 24px' }}>Lūdzu, mēģiniet vēlreiz vai zvaniet +371 28828400.{error.digest ? ` (${error.digest})` : ''}</p>
          <button onClick={reset} style={{ background: '#27C4A0', color: '#04141a', border: 0, borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            Mēģināt vēlreiz
          </button>
        </div>
      </body>
    </html>
  );
}
