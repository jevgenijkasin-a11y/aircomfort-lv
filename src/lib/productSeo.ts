// SEO text + structured data built from product fields, per locale.
// Everything here is derived from real product data — no invented facts.
// Manually written descriptions (description_lv/ru/en) always win over the
// generated paragraphs.
import { BASE_URL } from './seo';
import {
  type SupabaseProduct,
  productName,
  productFeatures,
  productImages,
  productDescription,
} from './types';

export type Loc = 'lv' | 'ru' | 'en';
export const asLoc = (l: string): Loc => (l === 'ru' || l === 'en' ? l : 'lv');

// ── slugs ─────────────────────────────────────────────────────────────
export const brandSlug = (brand: string) =>
  brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const CATEGORY_SLUGS: Record<string, string> = {
  home: 'home-air-conditioners',
  heat_pump: 'air-to-air-heat-pumps',
  commercial: 'commercial-air-conditioning',
  commercial_heat_pump: 'air-to-water-heat-pumps',
};
export const categoryFromSlug = (slug: string) =>
  Object.keys(CATEGORY_SLUGS).find((k) => CATEGORY_SLUGS[k] === slug) ?? null;

// Keys in the `categories` message namespace (plural labels for H1s)
export const CATEGORY_MSG_KEY: Record<string, string> = {
  home: 'home',
  heat_pump: 'heatPump',
  commercial: 'commercial',
  commercial_heat_pump: 'commercialHeatPump',
};

// Singular noun per category, used inside sentences
const CAT_NOUN: Record<string, Record<Loc, string>> = {
  home: { lv: 'mājas kondicionieris', ru: 'бытовой кондиционер', en: 'home air conditioner' },
  heat_pump: { lv: 'gaiss-gaiss siltumsūknis', ru: 'тепловой насос воздух-воздух', en: 'air-to-air heat pump' },
  commercial: { lv: 'komerciālais kondicionieris', ru: 'коммерческий кондиционер', en: 'commercial air conditioner' },
  commercial_heat_pump: { lv: 'gaiss-ūdens siltumsūknis', ru: 'тепловой насос воздух-вода', en: 'air-to-water heat pump' },
  fan_coils: { lv: 'fankoils', ru: 'фанкойл', en: 'fan coil unit' },
};
/** Fan coil subcategories (fan_coils_*) share the fan coil texts. */
const textKey = (cat: string) => (cat.startsWith('fan_coils') ? 'fan_coils' : cat);
export const categoryNoun = (cat: string, l: Loc) => (CAT_NOUN[textKey(cat)] ?? CAT_NOUN.home)[l];

// Manufacturer origin — public, verifiable facts only. Unknown brands get none.
const BRAND_ORIGIN: Record<string, Record<Loc, string>> = {
  'Daikin': { lv: 'Japānas ražotājs Daikin', ru: 'японская компания Daikin', en: 'Japanese manufacturer Daikin' },
  'Mitsubishi Electric': { lv: 'Japānas uzņēmums Mitsubishi Electric', ru: 'японская корпорация Mitsubishi Electric', en: 'Japanese company Mitsubishi Electric' },
  'Toshiba': { lv: 'Japānas uzņēmums Toshiba', ru: 'японская компания Toshiba', en: 'Japanese company Toshiba' },
  'Panasonic': { lv: 'Japānas uzņēmums Panasonic', ru: 'японская компания Panasonic', en: 'Japanese company Panasonic' },
  'Hisense': { lv: 'Ķīnas korporācija Hisense', ru: 'китайская корпорация Hisense', en: 'Chinese corporation Hisense' },
  'Midea': { lv: 'Ķīnas uzņēmums Midea, viens no lielākajiem klimata tehnikas ražotājiem pasaulē', ru: 'китайская Midea — один из крупнейших в мире производителей климатической техники', en: 'Midea from China, one of the world’s largest HVAC manufacturers' },
  'TCL': { lv: 'Ķīnas ražotājs TCL', ru: 'китайский производитель TCL', en: 'Chinese manufacturer TCL' },
  'LG': { lv: 'Dienvidkorejas uzņēmums LG', ru: 'южнокорейская компания LG', en: 'South Korean company LG' },
  'Samsung': { lv: 'Dienvidkorejas uzņēmums Samsung', ru: 'южнокорейская компания Samsung', en: 'South Korean company Samsung' },
  'Bosch': { lv: 'Vācijas uzņēmums Bosch', ru: 'немецкая компания Bosch', en: 'German company Bosch' },
};
export const brandOrigin = (brand: string, l: Loc) => BRAND_ORIGIN[brand]?.[l] ?? null;

// ── numeric helpers ───────────────────────────────────────────────────
/** Upper bound of the served area ("20–30" → 30, "līdz 45" → 45, "" → null). */
// Accepts "20–30", "25-35", "līdz 45", "45". Anything else (e.g. multi-split
// "3 telpas" = number of rooms) is NOT an area.
const AREA_RE = /^\s*(?:līdz\s*)?(\d+(?:[.,]\d+)?)\s*(?:[–-]\s*(\d+(?:[.,]\d+)?))?\s*$/i;
export function areaMax(p: SupabaseProduct): number | null {
  const m = (p.area_coverage || '').match(AREA_RE);
  if (!m) return null;
  return Number((m[2] ?? m[1]).replace(',', '.'));
}
/** Localized area value without unit, e.g. "20–30" or "до 45"; null if not an area. */
export function areaLabel(p: SupabaseProduct, l: Loc): string | null {
  const m = (p.area_coverage || '').match(AREA_RE);
  if (!m) return null;
  return m[2] ? `${m[1]}–${m[2]}` : /līdz/i.test(p.area_coverage) ? `${UP_TO_WORD[l]} ${m[1]}` : m[1];
}
const UP_TO_WORD: Record<Loc, string> = { lv: 'līdz', ru: 'до', en: 'up to' };
/** Multi-split systems store the number of rooms instead of an area ("3 telpas"). */
export function roomCount(p: SupabaseProduct): number | null {
  const m = (p.area_coverage || '').match(/(\d+)\s*telp/i);
  return m ? Number(m[1]) : null;
}
export function finalPrice(p: SupabaseProduct): number | null {
  if (!p.price) return null;
  return p.discount_percent ? Math.round(p.price * (1 - p.discount_percent / 100)) : Math.round(p.price);
}
const kw = (p: SupabaseProduct) => String(p.power_kw);
/** Features in this locale only — untagged legacy features are Latvian, so they are skipped for ru/en. */
/** Features in this locale only (legacy Latvian features are translated or dropped by productFeatures). */
function localFeatures(p: SupabaseProduct, l: Loc): string[] {
  return productFeatures(p, l);
}
const specsOf = (p: SupabaseProduct) =>
  p.specs && typeof p.specs === 'object' ? (p.specs as Record<string, string>) : {};

/** Stable per-product variant picker so texts differ between products. */
function pick<T>(p: SupabaseProduct, salt: number, options: T[]): T {
  let h = salt;
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return options[h % options.length];
}

/** Full model name, always starting with the brand. */
export function fullName(p: SupabaseProduct, l: Loc): string {
  const n = productName(p, l).trim();
  return n.toLowerCase().startsWith(p.brand.toLowerCase()) ? n : `${p.brand} ${n}`;
}

// ── title / description ──────────────────────────────────────────────
const KW: Record<Loc, string> = { lv: 'kW', ru: 'кВт', en: 'kW' };
const UP_TO: Record<Loc, string> = { lv: 'līdz', ru: 'до', en: 'up to' };

/** `{Brand} {Model} — {kW} kW, up to {m²} m²` (layout appends “| AirComfort”). */
export function productTitle(p: SupabaseProduct, locale: string): string {
  const l = asLoc(locale);
  const a = areaMax(p);
  return `${fullName(p, l)} — ${kw(p)} ${KW[l]}${a ? `, ${UP_TO[l]} ${a} ${l === 'ru' ? 'м²' : 'm²'}` : ''}`;
}

/** 140–160 char meta description assembled from product data. */
export function productMetaDescription(p: SupabaseProduct, locale: string, installFrom: number): string {
  const l = asLoc(locale);
  const name = fullName(p, l);
  const a = areaMax(p);
  const price = finalPrice(p);
  const noise = specsOf(p).noise_db;
  const rooms = roomCount(p);
  const roomsPart = rooms ? { lv: `, ${rooms} telpām`, ru: `, для ${rooms} комнат`, en: `, for ${rooms} rooms` }[l] : '';
  const feat = localFeatures(p, l)[0];

  const cls = p.energy_class ? { lv: `, klase ${p.energy_class}`, ru: `, класс ${p.energy_class}`, en: `, class ${p.energy_class}` }[l] : '';
  const core: Record<Loc, string> = {
    lv: `${name}: ${kw(p)} kW${a ? `, telpām līdz ${a} m²` : roomsPart}${cls}${noise ? `, ${noise} dB` : ''}.`,
    ru: `${name}: ${kw(p)} кВт${a ? `, для помещений до ${a} м²` : roomsPart}${cls}${noise ? `, ${noise} дБ` : ''}.`,
    en: `${name}: ${kw(p)} kW${a ? `, for rooms up to ${a} m²` : roomsPart}${cls}${noise ? `, ${noise} dB` : ''}.`,
  };
  const money: Record<Loc, string> = {
    lv: price ? ` Cena ${price} €, montāža no ${installFrom} €.` : ` Montāža no ${installFrom} €.`,
    ru: price ? ` Цена ${price} €, монтаж от ${installFrom} €.` : ` Монтаж от ${installFrom} €.`,
    en: price ? ` Price €${price}, installation from €${installFrom}.` : ` Installation from €${installFrom}.`,
  };
  const extras: Record<Loc, string[]> = {
    lv: [' Montāža visā Latvijā.', feat ? ` ${feat}.` : '', ' Bezmaksas konsultācija.'],
    ru: [' Монтаж по всей Латвии.', feat ? ` ${feat}.` : '', ' Бесплатная консультация.'],
    en: [' Installation across Latvia.', feat ? ` ${feat}.` : '', ' Free consultation.'],
  };

  // Short fillers (site-wide facts) to reach 140+ chars when the long extras don't fit
  const fillers: Record<Loc, string[]> = {
    lv: [' Montāža ar garantiju.', ' AirComfort.lv'],
    ru: [' Монтаж с гарантией.', ' AirComfort.lv'],
    en: [' Installation with warranty.', ' AirComfort.lv'],
  };
  let d = core[l] + money[l];
  for (const x of extras[l]) if (x && (d + x).length <= 160) d += x;
  for (const x of fillers[l]) if (d.length < 140 && (d + x).length <= 160) d += x;
  if (d.length > 160) d = d.slice(0, 157).replace(/[\s,.;:]+\S*$/, '') + '…';
  return d;
}

// ── body paragraphs ───────────────────────────────────────────────────
function areaSentence(p: SupabaseProduct, l: Loc): string {
  const a = areaMax(p);
  const rooms = roomCount(p);
  if (!a && rooms) return {
    ru: `Это мульти-сплит система: к одному наружному блоку подключаются внутренние блоки в ${rooms} комнатах, поэтому на фасаде остаётся один агрегат.`,
    lv: `Tā ir multi-split sistēma: vienam āra blokam pieslēdz iekšējos blokus ${rooms} telpās, tāpēc uz fasādes paliek tikai viens agregāts.`,
    en: `This is a multi-split system: one outdoor unit serves indoor units in ${rooms} rooms, so only a single unit sits on the façade.`,
  }[l];
  if (!a) return '';
  if (l === 'ru') {
    const where = a <= 30 ? 'спальни, детской или небольшого кабинета'
      : a <= 50 ? 'гостиной или квартиры-студии'
      : a <= 100 ? 'большой гостиной, помещения с открытой планировкой или небольшого офиса'
      : 'просторных офисов, магазинов и залов';
    return pick(p, 1, [
      `Производительности хватает на помещение площадью до ${a} м², поэтому модель подходит для ${where}.`,
      `Рассчитан на площадь до ${a} м² — это хороший выбор для ${where}.`,
    ]);
  }
  if (l === 'lv') {
    const where = a <= 30 ? 'guļamistabai, bērnu istabai vai nelielam kabinetam'
      : a <= 50 ? 'dzīvojamai istabai vai studijas tipa dzīvoklim'
      : a <= 100 ? 'plašai viesistabai, atvērtā plānojuma telpai vai nelielam birojam'
      : 'plašiem birojiem, veikaliem un zālēm';
    return pick(p, 1, [
      `Jauda ir pietiekama telpai līdz ${a} m², tāpēc modelis ir piemērots ${where}.`,
      `Paredzēts platībai līdz ${a} m² — laba izvēle ${where}.`,
    ]);
  }
  const where = a <= 30 ? 'a bedroom, nursery or small study'
    : a <= 50 ? 'a living room or studio apartment'
    : a <= 100 ? 'a large living area, open-plan space or small office'
    : 'large offices, shops and halls';
  return pick(p, 1, [
    `It is sized for spaces up to ${a} m², which makes it a good fit for ${where}.`,
    `With coverage of up to ${a} m², it suits ${where}.`,
  ]);
}

function purposeSentence(p: SupabaseProduct, l: Loc): string {
  const n = fullName(p, l);
  const k = kw(p);
  const texts: Record<string, Record<Loc, string>> = {
    home: {
      ru: `${n} — сплит-система мощностью ${k} кВт для квартиры или частного дома: летом охлаждает, в межсезонье может работать на обогрев.`,
      lv: `${n} ir ${k} kW sadalītā sistēma dzīvoklim vai privātmājai — vasarā tā dzesē, bet starpsezonā var arī sildīt.`,
      en: `The ${n} is a ${k} kW split system for apartments and houses — it cools in summer and can also heat in spring and autumn.`,
    },
    heat_pump: {
      ru: `${n} — тепловой насос воздух-воздух мощностью ${k} кВт: зимой он отапливает дом теплом наружного воздуха, а летом работает как обычный кондиционер.`,
      lv: `${n} ir ${k} kW gaiss-gaiss siltumsūknis: ziemā tas apsilda māju, izmantojot āra gaisa siltumu, bet vasarā darbojas kā kondicionieris.`,
      en: `The ${n} is a ${k} kW air-to-air heat pump: in winter it heats your home using warmth drawn from outdoor air, and in summer it works as an air conditioner.`,
    },
    commercial: {
      ru: `${n} — коммерческая климатическая система мощностью ${k} кВт для офисов, магазинов, кафе и других помещений бизнеса.`,
      lv: `${n} ir ${k} kW komerciālā klimata sistēma birojiem, veikaliem, kafejnīcām un citām uzņēmumu telpām.`,
      en: `The ${n} is a ${k} kW commercial climate system for offices, shops, cafés and other business premises.`,
    },
    commercial_heat_pump: {
      ru: `${n} мощностью ${k} кВт относится к системам воздух-вода: тепловой насос забирает тепло из наружного воздуха и передаёт его в водяной контур — для тёплых полов, радиаторов и горячей воды.`,
      lv: `${n} (${k} kW) ir paredzēts gaiss-ūdens sistēmām: siltumsūknis ņem siltumu no āra gaisa un nodod to ūdens lokam — grīdas apsildei, radiatoriem un karstajam ūdenim.`,
      en: `The ${n} (${k} kW) is designed for air-to-water systems: the heat pump extracts heat from outdoor air and transfers it to a water circuit for underfloor heating, radiators and hot water.`,
    },
    fan_coils: {
      ru: `${n} — фанкойл мощностью ${k} кВт: внутренний блок водяной системы, который обогревает или охлаждает помещение водой от теплового насоса воздух-вода.`,
      lv: `${n} ir ${k} kW fankoils — ūdens sistēmas iekšējais bloks, kas silda vai dzesē telpu ar ūdeni no siltumsūkņa gaiss-ūdens.`,
      en: `The ${n} is a ${k} kW fan coil unit — the indoor part of a hydronic system that heats or cools a room with water from an air-to-water heat pump.`,
    },
  };
  return (texts[textKey(p.category)] ?? texts.home)[l];
}

function efficiencySentence(p: SupabaseProduct, l: Loc): string {
  const c = p.energy_class;
  const T: Record<string, Record<Loc, string>> = {
    'A+++': {
      ru: 'Класс энергоэффективности A+++ — высший в шкале, поэтому счета за электричество остаются минимальными даже при ежедневной работе.',
      lv: 'Energoefektivitātes klase A+++ ir augstākā skalā, tāpēc elektrības rēķini paliek minimāli arī ikdienas lietošanā.',
      en: 'Its A+++ energy class is the top of the scale, so running costs stay low even with daily use.',
    },
    'A++': {
      ru: 'Класс A++ означает экономичную работу: расход электроэнергии заметно ниже, чем у техники более низких классов.',
      lv: 'Klase A++ nozīmē ekonomisku darbību — elektrības patēriņš ir ievērojami zemāks nekā zemāku klašu iekārtām.',
      en: 'The A++ rating means economical operation, with noticeably lower power consumption than lower-rated units.',
    },
    'A+': {
      ru: 'Класс энергоэффективности A+ даёт разумный баланс между потреблением энергии и ценой.',
      lv: 'Energoefektivitātes klase A+ nodrošina saprātīgu līdzsvaru starp enerģijas patēriņu un cenu.',
      en: 'The A+ energy class offers a sensible balance between power consumption and price.',
    },
  };
  if (T[c]) return T[c][l];
  if (!c) return ''; // fan coils etc. have no energy label
  return { ru: `Класс энергоэффективности — ${c}.`, lv: `Energoefektivitātes klase — ${c}.`, en: `Energy efficiency class: ${c}.` }[l];
}

// Proper names that must keep their capital letter inside a list
const KEEP_CASE = /^(Coanda|Daikin|Mitsubishi|Hisense|Midea|Toshiba|Panasonic|Samsung|Bosch|Alexa|Google|Hi-?NANO|Flash|Ururu|Sarara|Emura|Perfera|Stylish)/i;

/** Lower-case a feature's first letter for use mid-sentence ("— unikāls dizains, …"),
 *  but keep acronyms/model tokens (Wi-Fi, R32, DC, SEER, 3D) and proper names. */
function midSentence(f: string): string {
  const first = f.split(/\s/)[0];
  if (/[A-ZĀ-ŽА-ЯЁ0-9]/.test(first.slice(1)) || KEEP_CASE.test(first)) return f;
  return f.charAt(0).toLocaleLowerCase() + f.slice(1);
}

function featuresSentence(p: SupabaseProduct, l: Loc): string {
  const f = localFeatures(p, l).slice(0, 5).map(midSentence);
  if (!f.length) return '';
  const list = f.join(', ');
  return pick(p, 2, {
    ru: [`Ключевые функции: ${list}.`, `Среди возможностей модели — ${list}.`],
    lv: [`Galvenās funkcijas: ${list}.`, `Modeļa iespējas ietver: ${list}.`],
    en: [`Key features include ${list}.`, `Highlights: ${list}.`],
  }[l]);
}

function specSentence(p: SupabaseProduct, l: Loc): string {
  const s = specsOf(p);
  const parts: string[] = [];
  if (s.seer || s.scop) {
    const v = [s.seer && `SEER ${s.seer}`, s.scop && `SCOP ${s.scop}`].filter(Boolean).join(', ');
    parts.push({ ru: `Сезонная эффективность: ${v}.`, lv: `Sezonālā efektivitāte: ${v}.`, en: `Seasonal efficiency: ${v}.` }[l]);
  }
  if (s.noise_db) parts.push({ ru: `Уровень шума — ${s.noise_db} дБ.`, lv: `Trokšņa līmenis — ${s.noise_db} dB.`, en: `Noise level: ${s.noise_db} dB.` }[l]);
  if (s.refrigerant) parts.push({ ru: `Хладагент — ${s.refrigerant}.`, lv: `Aukstumaģents — ${s.refrigerant}.`, en: `Refrigerant: ${s.refrigerant}.` }[l]);
  return parts.join(' ');
}

function brandAndInstallParagraph(p: SupabaseProduct, l: Loc, installFrom: number): string {
  const origin = brandOrigin(p.brand, l);
  const price = finalPrice(p);
  const brandPart = origin
    ? { ru: `Производитель — ${origin}.`, lv: `Ražotājs — ${origin}.`, en: `It is made by ${origin}.` }[l]
    : '';
  const pricePart = price
    ? { ru: `Цена модели — ${price} €.`, lv: `Modeļa cena — ${price} €.`, en: `The unit costs €${price}.` }[l]
    : '';
  const install = pick(p, 3, {
    ru: [
      `Установку выполняют специалисты AirComfort по всей Латвии, монтаж — от ${installFrom} €. Перед покупкой можно бесплатно проконсультироваться и подобрать мощность под ваше помещение.`,
      `AirComfort устанавливает оборудование по всей Латвии, стоимость монтажа — от ${installFrom} €. Если сомневаетесь в выборе, мы бесплатно поможем подобрать модель.`,
    ],
    lv: [
      `Uzstādīšanu visā Latvijā veic AirComfort speciālisti, montāža — no ${installFrom} €. Pirms pirkuma varat saņemt bezmaksas konsultāciju un piemeklēt jaudu savai telpai.`,
      `AirComfort uzstāda iekārtas visā Latvijā, montāžas izmaksas — no ${installFrom} €. Ja šaubāties par izvēli, bez maksas palīdzēsim atrast piemērotāko modeli.`,
    ],
    en: [
      `AirComfort technicians install it anywhere in Latvia, with installation from €${installFrom}. Before buying you can get a free consultation to match the capacity to your room.`,
      `We install across Latvia, with installation starting at €${installFrom}. Not sure which model to pick? We’ll help you choose, free of charge.`,
    ],
  }[l]);
  return [brandPart, pricePart, install].filter(Boolean).join(' ');
}

/** 2–3 paragraphs. Manual descriptions take priority over the template. */
export function productParagraphs(p: SupabaseProduct, locale: string, installFrom: number): string[] {
  const l = asLoc(locale);
  // Only a description written in THIS language; otherwise generate one
  // (e.g. a Latvian-only text must not appear on /ru or /en).
  const manual = String(p[`description_${l}` as const] ?? '').trim();
  if (manual) return manual.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return [
    [purposeSentence(p, l), areaSentence(p, l)].filter(Boolean).join(' '),
    [featuresSentence(p, l), efficiencySentence(p, l), specSentence(p, l)].filter(Boolean).join(' '),
    brandAndInstallParagraph(p, l, installFrom),
  ].filter(Boolean);
}

// ── related products ─────────────────────────────────────────────────
export function similarProducts(all: SupabaseProduct[], p: SupabaseProduct, n = 6): SupabaseProduct[] {
  const others = all.filter((x) => x.id !== p.id);
  const byPower = (a: SupabaseProduct, b: SupabaseProduct) =>
    Math.abs(a.power_kw - p.power_kw) - Math.abs(b.power_kw - p.power_kw) || a.price - b.price;
  const sameBrand = others.filter((x) => x.brand === p.brand).sort(byPower);
  const out = sameBrand.slice(0, n);
  if (out.length < n) {
    const fill = others
      .filter((x) => x.brand !== p.brand && x.category === p.category)
      .sort(byPower)
      .slice(0, n - out.length);
    out.push(...fill);
  }
  return out;
}

// ── structured data ──────────────────────────────────────────────────
export const absUrl = (u: string) => (u.startsWith('http') ? u : `${BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`);

export function productJsonLd(p: SupabaseProduct, locale: string, url: string, description: string) {
  const l = asLoc(locale);
  const price = finalPrice(p);
  const images = productImages(p).map(absUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fullName(p, l),
    brand: { '@type': 'Brand', name: p.brand },
    sku: p.id,
    model: productName(p, l),
    category: categoryNoun(p.category, l),
    ...(images.length ? { image: images } : {}),
    description,
    url,
    ...(price
      ? {
          offers: {
            '@type': 'Offer',
            price: String(price),
            priceCurrency: 'EUR',
            availability: p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url,
            seller: { '@type': 'Organization', name: 'AirComfort', url: BASE_URL },
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** Safe JSON for embedding in a <script type="application/ld+json">. */
export const jsonLdString = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');
