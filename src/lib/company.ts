// Company data (config + admin overrides) and schema.org JSON-LD built from it.
import { siteConfig } from '@/config/site';

type Loc = 'lv' | 'ru' | 'en';
const loc = (l: string): Loc => (l === 'ru' || l === 'en' ? l : 'lv');
const abs = (path: string) => `${siteConfig.url}${path}`;

export const ORG_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/**
 * Company contact data for display. Phone / email / address edited in
 * Admin → Settings win over the config defaults (as before).
 */
export function getCompany(settings: Record<string, string> = {}, locale = 'lv') {
  const a = siteConfig.address;
  const phoneDisplay = settings.phone?.trim() || siteConfig.phoneDisplay;
  return {
    name: siteConfig.name,
    phoneDisplay,
    phoneHref: `tel:${phoneDisplay.replace(/[^\d+]/g, '')}`,
    email: settings.email?.trim() || siteConfig.email,
    address: settings.address?.trim() || `${a.street}, ${a.locality}, ${a.postalCode}`,
    hours: siteConfig.hoursLabel[loc(locale)],
    mapQuery: `${a.street}, ${a.locality}, ${a.postalCode}, Latvia`,
    social: Object.values(siteConfig.social).filter(Boolean) as string[],
  };
}

/** Organization + HVACBusiness node (one @id, referenced from other nodes). */
export function organizationNode(settings: Record<string, string> = {}) {
  const c = getCompany(settings);
  const a = siteConfig.address;
  const sameAs = c.social;
  return {
    '@type': ['Organization', 'HVACBusiness'],
    '@id': ORG_ID,
    name: siteConfig.name,
    alternateName: [...siteConfig.alternateNames],
    // omitted while the config still holds the "[…]" placeholder
    ...(siteConfig.legalName.startsWith('[') ? {} : { legalName: siteConfig.legalName }),
    url: `${siteConfig.url}/`,
    logo: { '@type': 'ImageObject', url: abs(siteConfig.logo), width: 512, height: 512 },
    image: abs(siteConfig.image),
    telephone: siteConfig.phone,
    email: c.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.locality,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: siteConfig.geo.latitude, longitude: siteConfig.geo.longitude },
    openingHoursSpecification: siteConfig.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...h.days],
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: { '@type': 'Country', name: siteConfig.areaServed },
    priceRange: siteConfig.priceRange,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Home page graph: the business + the website it publishes. */
export function homeJsonLd(locale: string, settings: Record<string, string> = {}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(settings),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: siteConfig.name,
        alternateName: siteConfig.alternateNames[0],
        url: `${siteConfig.url}/`,
        inLanguage: loc(locale),
        publisher: { '@id': ORG_ID },
      },
    ],
  };
}

/** Contacts page: ContactPage about the organization (full node included). */
export function contactPageJsonLd(locale: string, pageUrl: string, name: string, settings: Record<string, string> = {}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(settings),
      {
        '@type': 'ContactPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name,
        inLanguage: loc(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORG_ID },
        mainEntity: { '@id': ORG_ID },
      },
    ],
  };
}
