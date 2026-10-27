// Service pages (/[lang]/pakalpojumi/<slug>): types, field list, validation and
// the first DRAFT texts. Shared by the public pages, the admin and the DB seed.
// No server-only imports here.

export type Loc = 'lv' | 'ru' | 'en';
export const SERVICE_LOCALES: Loc[] = ['lv', 'ru', 'en'];

/** URL of the hub: the same Latvian slug in every language. */
export const SERVICES_HUB = '/pakalpojumi';
export const servicePath = (slug: string) => `${SERVICES_HUB}/${slug}`;

export interface Service {
  id: number;
  slug: string;
  sort_order: number;
  /** Draft: the page opens (noindex) but is not in the sitemap; admin shows "DRAFT". */
  is_draft: boolean;
  /** Value preselected in the contact form ("install", "maintenance"). */
  contact_service: string;
  /** Category keys (comma separated) for the products block and the automatic price. */
  product_categories: string;
  /** Manual "from … €" price; null = none (or automatic, see price_auto). */
  price_from: number | null;
  /** Price "from" = lowest install_price of the products in product_categories. */
  price_auto: boolean;
  title_lv: string; title_ru: string; title_en: string;
  meta_title_lv: string; meta_title_ru: string; meta_title_en: string;
  meta_description_lv: string; meta_description_ru: string; meta_description_en: string;
  /** Paragraphs separated by an empty line. */
  intro_lv: string; intro_ru: string; intro_en: string;
  /** "What the price includes": one item per line. */
  includes_lv: string; includes_ru: string; includes_en: string;
  /** "How the work goes": one step per line. */
  steps_lv: string; steps_ru: string; steps_en: string;
  warranty_lv: string; warranty_ru: string; warranty_en: string;
  created_at: string;
  updated_at: string;
}

const LOC_TEXT = ['title', 'meta_title', 'meta_description', 'intro', 'includes', 'steps', 'warranty'] as const;
export const SERVICE_TEXT_FIELDS = LOC_TEXT.flatMap((f) => SERVICE_LOCALES.map((l) => `${f}_${l}` as const));
/** Columns the admin may write (slug and dates are fixed). */
export const SERVICE_FIELDS = ['sort_order', 'is_draft', 'contact_service', 'product_categories', 'price_from', 'price_auto', ...SERVICE_TEXT_FIELDS] as const;

export const lines = (s: string | undefined | null) => (s ?? '').split('\n').map((x) => x.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
export const paragraphs = (s: string | undefined | null) => (s ?? '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);

/** Validates an admin PUT body; errors are in Russian like the rest of the admin. */
export function validateService(body: Record<string, unknown>): { data: Partial<Service>; errors: string[] } {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const f of SERVICE_TEXT_FIELDS) if (f in body) data[f] = String(body[f] ?? '').trim();
  if ('sort_order' in body) data.sort_order = Math.round(Number(body.sort_order) || 0);
  if ('is_draft' in body) data.is_draft = !!body.is_draft;
  if ('price_auto' in body) data.price_auto = !!body.price_auto;
  if ('contact_service' in body) data.contact_service = String(body.contact_service ?? '').trim().slice(0, 40);
  if ('product_categories' in body) data.product_categories = String(body.product_categories ?? '').replace(/\s+/g, '').slice(0, 200);
  if ('price_from' in body) {
    const v = body.price_from;
    if (v === null || v === '' || v === undefined) data.price_from = null;
    else if (!Number.isFinite(Number(v)) || Number(v) < 0) errors.push('Цена «от»: укажите число или оставьте пустым.');
    else data.price_from = Math.round(Number(v));
  }
  for (const l of SERVICE_LOCALES) {
    if (`title_${l}` in data && !data[`title_${l}`]) errors.push(`Заголовок (${l.toUpperCase()}) не может быть пустым.`);
  }
  return { data: data as Partial<Service>, errors };
}

// ── first texts (DRAFT) ───────────────────────────────────────────────
// Written from what the site already says (installation from one day, free
// consultation, installation with warranty, prices "from" the products). No
// new figures: warranty terms and the maintenance price are left empty (TODO).

type Seed = Omit<Service, 'id' | 'created_at' | 'updated_at'>;

export const SERVICE_SEED: Seed[] = [
  {
    slug: 'kondicionieru-montaza',
    sort_order: 1,
    is_draft: true,
    contact_service: 'install',
    product_categories: 'home,heat_pump',
    price_from: null,
    price_auto: true,
    title_lv: 'Kondicionieru montāža',
    title_ru: 'Монтаж кондиционеров',
    title_en: 'Air conditioner installation',
    meta_title_lv: 'Kondicionieru montāža Rīgā un Latvijā',
    meta_title_ru: 'Монтаж кондиционеров в Риге и Латвии',
    meta_title_en: 'Air conditioner installation in Riga and Latvia',
    meta_description_lv: 'Kondicionieru un gaiss-gaiss siltumsūkņu montāža Rīgā un visā Latvijā: bezmaksas konsultācija, iekārtas izvēle un uzstādīšana ar garantiju.',
    meta_description_ru: 'Монтаж кондиционеров и тепловых насосов воздух-воздух в Риге и по всей Латвии: бесплатная консультация, подбор техники и установка с гарантией.',
    meta_description_en: 'Air conditioner and air-to-air heat pump installation in Riga and across Latvia: free advice, choosing the unit and installation with warranty.',
    intro_lv: 'Uzstādām mājas kondicionierus un gaiss-gaiss siltumsūkņus dzīvokļos, privātmājās un birojos visā Latvijā. Palīdzam izvēlēties jaudu, atrast vietu iekšējam un ārējam blokam un veicam montāžu ar garantiju.\n\nMontāža parasti aizņem vienu dienu. Precīzu cenu nosaucam pēc telpas un trases apskates vai fotogrāfijām.',
    intro_ru: 'Устанавливаем бытовые кондиционеры и тепловые насосы воздух-воздух в квартирах, частных домах и офисах по всей Латвии. Поможем подобрать мощность, место для внутреннего и наружного блока и выполним монтаж с гарантией.\n\nМонтаж обычно занимает один день. Точную цену называем после осмотра помещения и трассы или по фотографиям.',
    intro_en: 'We install home air conditioners and air-to-air heat pumps in apartments, houses and offices across Latvia. We help you choose the capacity and the place for the indoor and outdoor units, and install with a warranty.\n\nInstallation usually takes one day. We give the exact price after seeing the room and the pipe route, in person or from photos.',
    includes_lv: 'Iekšējā un ārējā bloka uzstādīšana\nFreona trase un savienojumi\nKondensāta novadīšana\nSistēmas pārbaude un palaišana\nLietošanas instruktāža',
    includes_ru: 'Установка внутреннего и наружного блока\nФреоновая трасса и соединения\nОтвод конденсата\nПроверка и запуск системы\nИнструктаж по использованию',
    includes_en: 'Mounting the indoor and outdoor unit\nRefrigerant lines and connections\nCondensate drain\nSystem check and start-up\nHow-to-use briefing',
    steps_lv: 'Bezmaksas konsultācija pa tālruni vai e-pastu\nIekārtas un jaudas izvēle telpai\nMontāžas laika saskaņošana\nUzstādīšana — parasti vienā dienā\nPārbaude, palaišana un instruktāža',
    steps_ru: 'Бесплатная консультация по телефону или e-mail\nПодбор техники и мощности для помещения\nСогласование времени монтажа\nУстановка — обычно за один день\nПроверка, запуск и инструктаж',
    steps_en: 'Free consultation by phone or email\nChoosing the unit and capacity for the room\nAgreeing on the installation date\nInstallation — usually in one day\nCheck, start-up and briefing',
    warranty_lv: '', warranty_ru: '', warranty_en: '',
  },
  {
    slug: 'siltumsuknu-uzstadisana',
    sort_order: 2,
    is_draft: true,
    contact_service: 'install',
    product_categories: 'commercial_heat_pump,heat_pump',
    price_from: null,
    price_auto: true,
    title_lv: 'Siltumsūkņu uzstādīšana',
    title_ru: 'Установка тепловых насосов',
    title_en: 'Heat pump installation',
    meta_title_lv: 'Siltumsūkņu uzstādīšana Rīgā un Latvijā',
    meta_title_ru: 'Установка тепловых насосов в Риге и Латвии',
    meta_title_en: 'Heat pump installation in Riga and Latvia',
    meta_description_lv: 'Gaiss-ūdens un gaiss-gaiss siltumsūkņu uzstādīšana privātmājām un uzņēmumiem visā Latvijā: izvēle, montāža un palaišana.',
    meta_description_ru: 'Установка тепловых насосов воздух-вода и воздух-воздух для частных домов и компаний по всей Латвии: подбор, монтаж и запуск.',
    meta_description_en: 'Air-to-water and air-to-air heat pump installation for houses and businesses across Latvia: selection, installation and start-up.',
    intro_lv: 'Uzstādām gaiss-ūdens siltumsūkņus apkurei un karstā ūdens sagatavošanai, kā arī gaiss-gaiss siltumsūkņus. Palīdzam izvēlēties iekārtu atbilstoši mājas platībai un esošajai apkures sistēmai.\n\nPirms darba apskatām objektu un sagatavojam piedāvājumu ar iekārtu un montāžas izmaksām.',
    intro_ru: 'Устанавливаем тепловые насосы воздух-вода для отопления и горячей воды, а также тепловые насосы воздух-воздух. Поможем подобрать оборудование по площади дома и существующей системе отопления.\n\nПеред работой осматриваем объект и готовим предложение со стоимостью оборудования и монтажа.',
    intro_en: 'We install air-to-water heat pumps for heating and hot water, and air-to-air heat pumps. We help you choose a unit that fits the size of the house and the existing heating system.\n\nBefore the work we look at the site and prepare an offer with the cost of the equipment and installation.',
    includes_lv: 'Objekta apskate un iekārtas izvēle\nĀrējā bloka uzstādīšana\nPieslēgšana apkures sistēmai\nSistēmas uzpilde, pārbaude un palaišana\nVadības iestatīšana un instruktāža',
    includes_ru: 'Осмотр объекта и подбор оборудования\nУстановка наружного блока\nПодключение к системе отопления\nЗаполнение, проверка и запуск системы\nНастройка управления и инструктаж',
    includes_en: 'Site visit and choice of equipment\nMounting the outdoor unit\nConnection to the heating system\nFilling, check and start-up\nControl settings and briefing',
    steps_lv: 'Bezmaksas konsultācija\nObjekta apskate\nPiedāvājums ar iekārtu un montāžu\nUzstādīšana un pieslēgšana\nPalaišana un instruktāža',
    steps_ru: 'Бесплатная консультация\nОсмотр объекта\nПредложение с оборудованием и монтажом\nУстановка и подключение\nЗапуск и инструктаж',
    steps_en: 'Free consultation\nSite visit\nOffer with equipment and installation\nInstallation and connection\nStart-up and briefing',
    warranty_lv: '', warranty_ru: '', warranty_en: '',
  },
  {
    slug: 'kondicionieru-apkope',
    sort_order: 3,
    is_draft: true,
    contact_service: 'maintenance',
    product_categories: '',
    price_from: null,
    price_auto: false,
    title_lv: 'Kondicionieru apkope',
    title_ru: 'Обслуживание кондиционеров',
    title_en: 'Air conditioner maintenance',
    meta_title_lv: 'Kondicionieru apkope un tīrīšana Rīgā',
    meta_title_ru: 'Обслуживание и чистка кондиционеров в Риге',
    meta_title_en: 'Air conditioner maintenance and cleaning in Riga',
    meta_description_lv: 'Kondicionieru un siltumsūkņu tehniskā apkope, tīrīšana un remonts Rīgā un Latvijā. Ātra reaģēšana, bezmaksas konsultācija.',
    meta_description_ru: 'Техническое обслуживание, чистка и ремонт кондиционеров и тепловых насосов в Риге и Латвии. Быстрый выезд, бесплатная консультация.',
    meta_description_en: 'Maintenance, cleaning and repair of air conditioners and heat pumps in Riga and Latvia. Fast response, free advice.',
    intro_lv: 'Regulāra apkope palīdz kondicionierim strādāt klusāk, efektīvāk un ilgāk. Veicam tehnisko apkopi, tīrīšanu un remontu kondicionieriem un siltumsūkņiem.',
    intro_ru: 'Регулярное обслуживание помогает кондиционеру работать тише, эффективнее и дольше. Выполняем техническое обслуживание, чистку и ремонт кондиционеров и тепловых насосов.',
    intro_en: 'Regular maintenance helps an air conditioner run quieter, more efficiently and longer. We service, clean and repair air conditioners and heat pumps.',
    includes_lv: 'Filtru tīrīšana\nIekšējā bloka tīrīšana\nĀrējā bloka pārbaude\nKondensāta novadīšanas pārbaude\nDarbības pārbaude',
    includes_ru: 'Чистка фильтров\nЧистка внутреннего блока\nПроверка наружного блока\nПроверка отвода конденсата\nПроверка работы',
    includes_en: 'Filter cleaning\nIndoor unit cleaning\nOutdoor unit check\nCondensate drain check\nOperation check',
    steps_lv: 'Pieteikums pa tālruni vai formā\nLaika saskaņošana\nApkope uz vietas\nIeteikumi turpmākai lietošanai',
    steps_ru: 'Заявка по телефону или через форму\nСогласование времени\nОбслуживание на месте\nРекомендации по дальнейшей эксплуатации',
    steps_en: 'Request by phone or the form\nAgreeing on the time\nOn-site maintenance\nAdvice for further use',
    warranty_lv: '', warranty_ru: '', warranty_en: '',
  },
];

/** Labels of the service pages. */
export const SERVICE_TX = {
  hub: { lv: 'Pakalpojumi', ru: 'Услуги', en: 'Services' },
  includes: { lv: 'Kas ietilpst cenā', ru: 'Что входит в цену', en: 'What the price includes' },
  steps: { lv: 'Kā notiek darbs', ru: 'Как проходит работа', en: 'How it works' },
  warranty: { lv: 'Garantija', ru: 'Гарантия', en: 'Warranty' },
  products: { lv: 'Piemērotas iekārtas', ru: 'Подходящее оборудование', en: 'Suitable equipment' },
  others: { lv: 'Citi pakalpojumi', ru: 'Другие услуги', en: 'Other services' },
  calc: { lv: 'Aprēķināt jaudu kalkulatorā', ru: 'Рассчитать мощность в калькуляторе', en: 'Work out the capacity' },
  from: { lv: (n: number) => `no ${n} €`, ru: (n: number) => `от ${n} €`, en: (n: number) => `from €${n}` },
  priceLabel: { lv: 'Cena', ru: 'Цена', en: 'Price' },
  onRequest: { lv: 'Cenu nosauksim pēc pieteikuma', ru: 'Цену назовём по заявке', en: 'Price on request' },
};
