import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'AirComfort Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // The admin stays dark: pin the dark tokens (scrollbar etc.) and keep the
    // browser's default form-control look it always had.
    <html lang="ru" data-theme="dark" style={{ colorScheme: 'normal' }}>
      <body style={{ margin: 0, background: '#0B1929', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
