import type { Config } from 'tailwindcss';

// Tailwind config used ONLY by /admin-v2 (loaded via @config in admin-v2.css),
// so the admin palette/utilities never reach the public site's CSS bundle.
// Palette ported from TailAdmin (MIT), brand scale re-tinted to AirComfort.
const config: Config = {
  content: [
    './src/app/admin-v2/**/*.{ts,tsx}',
    './src/components/admin-v2/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          25: '#f2fbf8', 50: '#e6f7f2', 100: '#c9eee3', 200: '#9fe0cd', 300: '#63cbb0',
          400: '#27C4A0', 500: '#0B7A63', 600: '#096652', 700: '#075243', 800: '#064236', 900: '#04332a', 950: '#022019',
        },
        accent: '#27C4A0',
        navy: '#0A1628',
        gray: {
          25: '#fcfcfd', 50: '#f9fafb', 100: '#f2f4f7', 200: '#e4e7ec', 300: '#d0d5dd', 400: '#98a2b3',
          500: '#667085', 600: '#475467', 700: '#344054', 800: '#1d2939', 900: '#101828', 950: '#0c111d', dark: '#111f35',
        },
        success: { 50: '#ecfdf3', 100: '#d1fadf', 500: '#12b76a', 600: '#039855', 700: '#027a48' },
        error: { 50: '#fef3f2', 100: '#fee4e2', 400: '#f97066', 500: '#f04438', 600: '#d92d20', 700: '#b42318' },
        warning: { 50: '#fffaeb', 100: '#fef0c7', 500: '#f79009', 600: '#dc6803', 700: '#b54708' },
      },
      fontSize: {
        'theme-xs': ['12px', '18px'],
        'theme-sm': ['14px', '20px'],
        'theme-xl': ['20px', '30px'],
        'title-sm': ['30px', '38px'],
        'title-md': ['36px', '44px'],
      },
      boxShadow: {
        'theme-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'theme-sm': '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
        'theme-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'theme-lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'theme-xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        focus: '0px 0px 0px 4px rgba(11, 122, 99, 0.14)',
      },
      zIndex: { 99: '99', 999: '999', 9999: '9999', 99999: '99999' },
    },
  },
  plugins: [],
};

export default config;
