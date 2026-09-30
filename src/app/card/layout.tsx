import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Same fonts as the main site (it has its own layout, so they are loaded here
// too); otherwise each phone fell back to its own system font.
const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', weight: ['400', '500', '600', '700'], display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-manrope', weight: ['700', '800'], display: 'swap' });

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv" className={`${inter.variable} ${manrope.variable}`}>
      <body className={inter.className} style={{ margin: 0, padding: 0, background: '#0B1929' }}>
        {children}
      </body>
    </html>
  );
}
