// Server-side data for the service pages: products, the "from" price, JSON-LD.
import { listProducts, listCategories, listServices } from './db';
import { descendantKeys, hiddenKeys } from './categories';
import { visibleProducts, pricedFirst } from './catalogData';
import { BASE_URL } from './seo';
import { ORG_ID, organizationNode } from './company';
import { type Service, type Loc, paragraphs, servicePath, SERVICES_HUB } from './services';
import type { SupabaseProduct } from './types';

/** In-stock public products of the service's categories (and their subcategories). */
async function productsOf(s: Service): Promise<SupabaseProduct[]> {
  const keys = s.product_categories.split(',').map((k) => k.trim()).filter(Boolean);
  if (!keys.length) return [];
  const cats = listCategories();
  const all = new Set(keys.flatMap((k) => Array.from(descendantKeys(cats, k))));
  const products = visibleProducts(await listProducts({ inStockOnly: true, orderBy: 'price' }), hiddenKeys(cats));
  return pricedFirst(products.filter((p) => all.has(p.category)));
}

/** "From" price: the manual value, else (auto) the lowest installation price of its products, else null. */
export async function servicePrice(s: Service): Promise<number | null> {
  if (s.price_from !== null && s.price_from > 0) return s.price_from;
  if (!s.price_auto) return null;
  const prices = (await productsOf(s)).map((p) => p.install_price).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : null;
}

/** 4–6 products for the page: hits and promos first, then the cheapest. */
export async function serviceProducts(s: Service, n = 6): Promise<SupabaseProduct[]> {
  const list = await productsOf(s);
  const rank = (p: SupabaseProduct) => (p.is_hit ? 0 : p.is_promo ? 1 : 2);
  return list.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).slice(0, n).map((x) => x.p);
}

/** Services shown on the site: everything except drafts (drafts open by direct link, noindex). */
export const publicServices = () => listServices({ publicOnly: true });
/** Hub, menus and home cards list all services (drafts included) so links never go missing. */
export const allServices = () => listServices();

export function serviceJsonLd(s: Service, l: Loc, price: number | null, settings: Record<string, string>) {
  const url = `${BASE_URL}/${l}${servicePath(s.slug)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(settings),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: s[`title_${l}`],
        serviceType: s.title_en || s[`title_${l}`],
        description: s[`meta_description_${l}`] || paragraphs(s[`intro_${l}`])[0] || undefined,
        url,
        provider: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'Latvija' },
        ...(price ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price,
            priceSpecification: { '@type': 'PriceSpecification', minPrice: price, priceCurrency: 'EUR' },
            url,
          },
        } : {}),
      },
    ],
  };
}

export const hubUrl = (l: Loc) => `${BASE_URL}/${l}${SERVICES_HUB}`;
