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
    googleBusiness: '',
  },
} as const;

export type SiteConfig = typeof siteConfig;
