// Text under the calculator: how the capacity is worked out and what the
// price depends on. Every number comes from lib/calc (the same constants the
// calculator uses) or from the installation prices in the settings, so the
// text can never disagree with the result.
import { Link } from '@/i18n/navigation';
import {
  BASE_W_PER_M2, INSULATION_FACTOR, TOP_FLOOR_FACTOR, ROOM_FACTOR, W_PER_EXTRA_WINDOW, STANDARD_SIZES_KW, MAX_OVERSIZE,
} from '@/lib/calc';
import { servicePath } from '@/lib/services';
import type { Loc } from '@/lib/productSeo';

const pct = (f: number) => `${Math.round(Math.abs(f - 1) * 100)}%`;
const m2PerKw = 1000 / BASE_W_PER_M2; // 10 m² per kW
const sizes = (l: Loc) => STANDARD_SIZES_KW.map((k) => (l === 'en' ? k.toFixed(1) : k.toFixed(1).replace('.', ','))).join(' · ');
const install = servicePath('kondicionieru-montaza');

export default function CalculatorGuide({ locale, installFrom }: { locale: Loc; installFrom: number }) {
  const l = locale;
  const C = {
    lv: {
      h: 'Kā kalkulators aprēķina kondicioniera jaudu',
      p: [
        `Pamatā ir ${BASE_W_PER_M2} W dzesēšanas jaudas uz katru kvadrātmetru — aptuveni 1 kW uz ${m2PerKw} m² telpai ar standarta griestiem līdz ~2,7 m. Augstākiem griestiem un nestandarta telpām jaudu labāk precizēt ar mūsu speciālistu.`,
        `Tad aprēķinu koriģē: labi siltinātai jaunbūvei jauda samazinās par ${pct(INSULATION_FACTOR.good)}, vecai ēkai ar sliktu siltināšanu palielinās par ${pct(INSULATION_FACTOR.poor)}. Augšējā stāvā siltums nāk arī caur jumtu (+${pct(TOP_FLOOR_FACTOR)}), birojā ir vairāk tehnikas (+${pct(ROOM_FACTOR.office)}), virtuvē — siltums no plīts (+${pct(ROOM_FACTOR.kitchen)}). Katrs logs pēc pirmā pievieno ${W_PER_EXTRA_WINDOW} W saules siltuma.`,
        `Rezultātu noapaļo uz augšu līdz tuvākajam standarta modeļa izmēram (${sizes(l)} kW). Kā piemērotus modeļus rādām iekārtas, kas nav vājākas par vajadzīgo un ne vairāk kā par ${pct(MAX_OVERSIZE)} jaudīgākas — pārāk liela iekārta bieži ieslēdzas un izslēdzas.`,
        `Montāža — no ${installFrom} €. Galīgā cena ir atkarīga no trases garuma un darbu sarežģītības, un to apstiprinām pēc apskates.`,
      ],
      link: 'Kas ietilpst kondicioniera montāžā',
    },
    ru: {
      h: 'Как калькулятор рассчитывает мощность кондиционера',
      p: [
        `В основе — ${BASE_W_PER_M2} Вт холодопроизводительности на каждый квадратный метр, то есть примерно 1 кВт на ${m2PerKw} м² для помещения со стандартными потолками до ~2,7 м. Для высоких потолков и нестандартных помещений мощность лучше уточнить у нашего специалиста.`,
        `Затем расчёт корректируется: для утеплённого нового дома мощность меньше на ${pct(INSULATION_FACTOR.good)}, для старого здания с плохим утеплением — больше на ${pct(INSULATION_FACTOR.poor)}. На последнем этаже тепло идёт ещё и через крышу (+${pct(TOP_FLOOR_FACTOR)}), в офисе больше техники (+${pct(ROOM_FACTOR.office)}), на кухне — тепло от плиты (+${pct(ROOM_FACTOR.kitchen)}). Каждое окно после первого добавляет ${W_PER_EXTRA_WINDOW} Вт солнечного тепла.`,
        `Результат округляется вверх до ближайшего стандартного типоразмера (${sizes(l)} кВт). Подходящими считаем модели не слабее нужной мощности и не более чем на ${pct(MAX_OVERSIZE)} мощнее — слишком большой кондиционер часто включается и выключается.`,
        `Монтаж — от ${installFrom} €. Окончательная цена зависит от длины трассы и сложности работ, её подтверждаем после осмотра.`,
      ],
      link: 'Что входит в монтаж кондиционера',
    },
    en: {
      h: 'How the calculator works out the capacity',
      p: [
        `It starts from ${BASE_W_PER_M2} W of cooling per square metre — about 1 kW per ${m2PerKw} m² for a room with standard ceilings up to ~2.7 m. For higher ceilings or unusual rooms, it is best to check the capacity with our specialist.`,
        `The result is then adjusted: a well-insulated new building needs ${pct(INSULATION_FACTOR.good)} less, an old poorly insulated one ${pct(INSULATION_FACTOR.poor)} more. On the top floor heat also comes through the roof (+${pct(TOP_FLOOR_FACTOR)}), an office has more equipment (+${pct(ROOM_FACTOR.office)}) and a kitchen gets heat from cooking (+${pct(ROOM_FACTOR.kitchen)}). Every window after the first adds ${W_PER_EXTRA_WINDOW} W of solar heat.`,
        `The figure is rounded up to the nearest standard unit size (${sizes(l)} kW). As matching models we show units that are not weaker than needed and at most ${pct(MAX_OVERSIZE)} more powerful — an oversized unit keeps switching on and off.`,
        `Installation is from €${installFrom}. The final price depends on the pipe run length and the complexity of the job and is confirmed after a site visit.`,
      ],
      link: 'What air conditioner installation includes',
    },
  }[l];

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <h2 className="font-heading font-bold text-2xl sm:text-3xl mb-5">{C.h}</h2>
      <div className="space-y-4 text-muted leading-relaxed">
        {C.p.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <Link href={install as any} className="inline-block mt-5 text-sm font-semibold text-primary hover:underline">{C.link} →</Link>
    </section>
  );
}
