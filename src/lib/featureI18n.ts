// Translations for legacy product features stored without a locale prefix
// (they were entered in Latvian). Technical tokens with no Latvian letters
// (Inverter, R32, Wi-Fi, VRF…) are shown as-is in every language; Latvian
// phrases without a translation here are hidden on ru/en pages rather than
// shown untranslated.
const LEGACY: Record<string, { ru: string; en: string }> = {
  'Zemu temperatūru darbība -25°C': { ru: 'Работа при морозе до −25 °C', en: 'Operation down to −25 °C' },
  'Integrēta karstā ūdens ražošana': { ru: 'Встроенный нагрев горячей воды', en: 'Integrated hot water production' },
  'WiFi vadība': { ru: 'Управление по Wi-Fi', en: 'Wi-Fi control' },
  'Kanāls': { ru: 'Канальный', en: 'Ducted' },
  'Siltumsūknis': { ru: 'Тепловой насос', en: 'Heat pump' },
  'Gaiss-Ūders': { ru: 'Воздух-вода', en: 'Air-to-water' },
  'Kompakts dizains': { ru: 'Компактный корпус', en: 'Compact design' },
  'Viegla uzstādīšana': { ru: 'Простой монтаж', en: 'Easy installation' },
  'Jaukšanas ierīce iekļauta': { ru: 'Смесительный узел в комплекте', en: 'Mixing unit included' },
  'Augsta temp.': { ru: 'Высокотемпературный', en: 'High temperature' },
  'Kasetes': { ru: 'Кассетный', en: 'Cassette' },
  '360° gaisa plūsma': { ru: 'Воздушный поток 360°', en: '360° airflow' },
  'Filtrs': { ru: 'Фильтр', en: 'Filter' },
  'Siltumsūknis gaiss-ūdens': { ru: 'Тепловой насос воздух-вода', en: 'Air-to-water heat pump' },
  'R-32 apkopes viela': { ru: 'Хладагент R-32', en: 'R-32 refrigerant' },
  'Klusais režīms 25dB': { ru: 'Тихий режим 25 дБ', en: 'Quiet mode 25 dB' },
};

const LV_LETTERS = /[āēīūķļņšžčģĀĒĪŪĶĻŅŠŽČĢ]/;

/** Returns the feature for this locale, or null if it can't be shown. */
export function translateLegacyFeature(f: string, locale: string): string | null {
  if (locale === 'lv') return f;
  const l = locale === 'ru' ? 'ru' : 'en';
  if (LEGACY[f]) return LEGACY[f][l];
  const cop = f.match(/^COP līdz ([\d.,]+)$/);
  if (cop) return l === 'ru' ? `COP до ${cop[1]}` : `COP up to ${cop[1]}`;
  return LV_LETTERS.test(f) ? null : f;
}
