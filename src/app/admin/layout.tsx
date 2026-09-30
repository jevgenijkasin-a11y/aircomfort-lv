import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './admin-v2.css';

export const metadata: Metadata = {
  title: 'AirComfort Admin',
  robots: { index: false, follow: false },
};

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' });

// Theme before first paint (saved choice → OS setting), like the public site
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('adminV2Theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function AdminV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
