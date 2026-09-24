// Intro texts + meta for brand and category landing pages, built from the
// products actually in the catalogue (counts, capacity and price ranges).
import type { SupabaseProduct } from './types';
import { type Loc, brandOrigin, finalPrice } from './productSeo';

export type Stats = { n: number; minKw: number; maxKw: number; minP: number | null; maxP: number | null };

export function stats(products: SupabaseProduct[]): Stats {
  const kws = products.map((p) => p.power_kw).filter((x) => x > 0);
  const prices = products.map(finalPrice).filter((x): x is number => !!x);
  return {
    n: products.length,
    minKw: kws.length ? Math.min(...kws) : 0,
    maxKw: kws.length ? Math.max(...kws) : 0,
    minP: prices.length ? Math.min(...prices) : null,
    maxP: prices.length ? Math.max(...prices) : null,
  };
}

const ruPlural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
const lvPlural = (n: number, one: string, many: string) => (n % 10 === 1 && n % 100 !== 11 ? one : many);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function brandH1(brand: string, l: Loc) {
  return {
    lv: `${brand} kondicionieri un siltumsūkņi`,
    ru: `Кондиционеры и тепловые насосы ${brand}`,
    en: `${brand} air conditioners and heat pumps`,
  }[l];
}

export function brandIntro(brand: string, s: Stats, catLabels: string[], l: Loc, install: number): string[] {
  const origin = brandOrigin(brand, l);
  const cats = catLabels.join(', ').toLowerCase();
  const range = s.minKw === s.maxKw ? `${s.minKw}` : `${s.minKw}–${s.maxKw}`;
  const price = s.minP ? (s.minP === s.maxP ? `${s.minP}` : `${s.minP}–${s.maxP}`) : null;
  if (l === 'ru') return [
    `В каталоге AirComfort — ${s.n} ${ruPlural(s.n, 'модель', 'модели', 'моделей')} ${brand}: ${cats}. Мощность — ${range} кВт${price ? `, цены — ${price} €` : ''}.${origin ? ` Производитель — ${origin}.` : ''}`,
    `Мы поможем подобрать модель ${brand} под площадь и назначение помещения и выполним монтаж по всей Латвии — от ${install} €. Консультация бесплатная.`,
  ];
  if (l === 'en') return [
    `AirComfort offers ${s.n} ${brand} ${s.n === 1 ? 'model' : 'models'}: ${cats}. Capacity ${range} kW${price ? `, prices €${price}` : ''}.${origin ? ` Manufacturer: ${origin}.` : ''}`,
    `We’ll help you pick the right ${brand} unit for your room size and use, and install it anywhere in Latvia from €${install}. Advice is free.`,
  ];
  return [
    `AirComfort katalogā — ${s.n} ${brand} ${lvPlural(s.n, 'modelis', 'modeļi')}: ${cats}. Jauda ${range} kW${price ? `, cenas ${price} €` : ''}.${origin ? ` Ražotājs — ${origin}.` : ''}`,
    `Palīdzēsim izvēlēties ${brand} modeli atbilstoši telpas platībai un mērķim, un veiksim montāžu visā Latvijā — no ${install} €. Konsultācija ir bez maksas.`,
  ];
}

export function brandMeta(brand: string, s: Stats, l: Loc, install: number) {
  const from = s.minP ? { lv: `, cenas no ${s.minP} €`, ru: `, цены от ${s.minP} €`, en: `, prices from €${s.minP}` }[l] : '';
  return {
    title: { lv: `${brand} kondicionieri un siltumsūkņi — cenas`, ru: `Кондиционеры ${brand} — цены и монтаж`, en: `${brand} air conditioners — prices & installation` }[l],
    description: {
      lv: `${s.n} ${brand} ${lvPlural(s.n, 'modelis', 'modeļi')} no ${s.minKw} līdz ${s.maxKw} kW${from}. Montāža visā Latvijā no ${install} €, bezmaksas konsultācija.`,
      ru: `${s.n} ${ruPlural(s.n, 'модель', 'модели', 'моделей')} ${brand} мощностью ${s.minKw}–${s.maxKw} кВт${from}. Монтаж по всей Латвии от ${install} €, бесплатная консультация.`,
      en: `${s.n} ${brand} ${s.n === 1 ? 'model' : 'models'}, ${s.minKw}–${s.maxKw} kW${from}. Installation across Latvia from €${install}, free advice.`,
    }[l],
  };
}

export function categoryIntro(label: string, siteDesc: string, s: Stats, brands: string[], l: Loc, install: number): string[] {
  const range = `${s.minKw}–${s.maxKw}`;
  const top = brands.slice(0, 5).join(', ');
  if (l === 'ru') return [
    siteDesc,
    `Сейчас в разделе «${label}» ${s.n} ${ruPlural(s.n, 'модель', 'модели', 'моделей')} от ${brands.length} ${ruPlural(brands.length, 'производителя', 'производителей', 'производителей')} (${top}), мощность ${range} кВт${s.minP ? `, цены от ${s.minP} €` : ''}. Монтаж по всей Латвии — от ${install} €.`,
  ];
  if (l === 'en') return [
    siteDesc,
    `The “${label}” range currently includes ${s.n} models from ${brands.length} ${brands.length === 1 ? 'brand' : 'brands'} (${top}), ${range} kW${s.minP ? `, from €${s.minP}` : ''}. Installation anywhere in Latvia from €${install}.`,
  ];
  return [
    siteDesc,
    `Sadaļā “${label}” pašlaik ir ${s.n} ${lvPlural(s.n, 'modelis', 'modeļi')} no ${brands.length} ${lvPlural(brands.length, 'ražotāja', 'ražotājiem')} (${top}), jauda ${range} kW${s.minP ? `, cenas no ${s.minP} €` : ''}. Montāža visā Latvijā — no ${install} €.`,
  ];
}

export function categoryMeta(label: string, s: Stats, l: Loc, install: number) {
  return {
    title: { lv: `${label} — cenas un montāža`, ru: `${label} — цены и монтаж`, en: `${label} — prices & installation` }[l],
    description: {
      lv: `${cap(label)}: ${s.n} ${lvPlural(s.n, 'modelis', 'modeļi')}, ${s.minKw}–${s.maxKw} kW${s.minP ? `, no ${s.minP} €` : ''}. Montāža visā Latvijā no ${install} €, bezmaksas konsultācija.`,
      ru: `${cap(label)}: ${s.n} ${ruPlural(s.n, 'модель', 'модели', 'моделей')}, ${s.minKw}–${s.maxKw} кВт${s.minP ? `, от ${s.minP} €` : ''}. Монтаж по всей Латвии от ${install} €, бесплатная консультация.`,
      en: `${cap(label)}: ${s.n} models, ${s.minKw}–${s.maxKw} kW${s.minP ? `, from €${s.minP}` : ''}. Installation across Latvia from €${install}, free advice.`,
    }[l],
  };
}
