import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, padding: 0, background: '#0B1929' }}>
        {children}
      </body>
    </html>
  );
}
