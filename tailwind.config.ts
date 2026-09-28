import type { Config } from 'tailwindcss';

// Theme tokens are CSS variables holding "R G B" channels (see globals.css),
// so Tailwind opacity modifiers keep working: bg-accent/10, text-fg/80 …
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // `dark:` variants follow the site theme attribute, not only the OS setting
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        page: token('bg'),
        surface: token('surface'),
        card: token('card'),
        line: token('border'),
        'line-strong': token('border-strong'),
        fg: token('text'),
        muted: token('text-muted'),
        primary: token('primary'),
        'primary-hover': token('primary-hover'),
        'on-primary': token('on-primary'),
        accent: token('accent'),
        tint: token('tint'),
        cool: token('cool'),
        heat: token('heat'),
        'energy-bg': token('energy-bg'),
        'energy-fg': token('energy-fg'),
        photo: token('photo-bg'),
        // Brand teal for glows/shadows: half as strong in the light theme
        glow: 'rgb(39 196 160 / calc(<alpha-value> * var(--glow-k)))',
        // Constant brand navy (top strip, footer, CTA banner) in both themes
        ink: '#0A1628',
        // Fixed colours, same in both themes (white text on hit/promo passes AA)
        hit: '#C2410C',
        promo: '#BE185D',
        sale: '#EAB308',
        'logo-blue': '#1A6B9A',
        whatsapp: '#25D366',
        telegram: '#229ED9',
      },
      fontFamily: {
        heading: ['var(--font-manrope)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
};

export default config;
