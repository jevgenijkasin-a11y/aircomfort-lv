// Single source of truth for company data: footer, contacts page, privacy page
// and structured data (JSON-LD) all read from here via lib/company.ts.
// Phone / email / display address can still be overridden in Admin → Settings.

export const siteConfig = {
  name: 'AirComfort',
  alternateNames: ['AirComfort.lv', 'Air Comfort'],
  url: 'https://aircomfort.lv',
  // TODO(owner): fill in the registered company name, e.g. 'SIA "…"'
  legalName: '[ЮРИДИЧЕСКОЕ НАЗВАНИЕ SIA]',

  phone: '+37128828400',
  phoneDisplay: '+371 28828400',
  email: 'info@aircomfort.lv',

  address: {
    street: 'Katlakalna iela 8',
    locality: 'Rīga',
    postalCode: 'LV-1073',
    country: 'LV',
  },
  // Katlakalna iela 8, Rīga (building centroid, OpenStreetMap)
  geo: { latitude: 56.929723, longitude: 24.196629 },

  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
  ],
  hoursLabel: { lv: 'P–Pk 9:00–18:00', ru: 'Пн–Пт 9:00–18:00', en: 'Mon–Fri 9:00–18:00' },

  areaServed: 'Latvija',
  priceRange: '€€',

  // Absolute URLs are built from these paths
  logo: '/logo.png',
  image: '/lv/opengraph-image',

  // TODO(owner): paste profile URLs. Empty values are not output anywhere.
  social: {
    facebook: '',
    instagram: '',
    // Google Business Profile (knowledge graph id) — used in JSON-LD sameAs
    googleBusiness: 'https://www.google.com/search?kgmid=/g/11zz2h3r72',
    // "Find us on Google" link (footer + contacts) is switched off at the owner's
    // request; put https://share.google/9tGum3j2ZWNO61y01 back to show it again.
    googleShare: '',
  },
  // TODO(owner): Google "write a review" link; the review buttons stay hidden while empty
  googleReviewUrl: '',
} as const;

export type SiteConfig = typeof siteConfig;
