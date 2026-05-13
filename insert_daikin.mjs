import { writeFileSync } from 'fs';

// ============================================================
// IMAGE DATA
// ============================================================
const images = {
  "FTXM-R": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXM-R-006.tiff/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXM-R-009.tiff/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXM-R-011.tiff/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXM-R-013.tiff/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Accessories/Controls/Packshots/ARC466A67.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FTXTP-N": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXTP-N.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXTP-N/FTXTP-N%20Front.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXTP-N/FTXTP-N_Vintage%20Lover_16-9_1A.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXTP-N/FTXTP-N_Vintage%20Lover_16-9_1B.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXTP-N/FTXTP-N_Vintage%20Lover_16-9_2A.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FTXJ-AW": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AW/FTXJ-AW_front.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AW/FTXJ-AW_front_schaduw.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AW/FTXJ-AW_left.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AW/FTXJ-AW_right.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AW/FTXJ-AW_01_001.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AW/FTXJ-AW_01_002.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AW/FTXJ-AW_02_001.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AW/FTXJ-AW_closed.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AW/FTXJ-AW_open.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FTXJ-AS": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AS/FTXJ-AS_front_met%20pad.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AS/FTXJ-AS_front_schaduw.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AS/FTXJ-AS_left.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AS/FTXJ-AS_right.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AS/FTXJ-AS_01_001.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AS/FTXJ-AS_01_002.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AS/FTXJ-AS_closed.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AS/FTXJ-AS_open.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FTXJ-AB": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AB/FTXJ-AB_front.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXJ-AB/FTXJ-AB_left.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXJ-AB/FTXJ-AB_01_001.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Accessories/Controls/Installation%20Pictures/ARC488A1(W-B-S)_onecta/ARC488A1B_001.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FTXZ-N": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXZ-N_F.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXZ-N_L.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FTXZ-N_R.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/InstallationPictures/FTXZ-N_29.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/ARC477A1_aan.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FVXM-A": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Split/IndoorUnits/Packshots/FVXM-A_F.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "ERGA-EV": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/Heating/OutdoorUnits/Packshots/ERGA-EV_F.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Heating/OutdoorUnits/Packshots/ERGA-EV_L.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Heating/OutdoorUnits/Packshots/ERGA-EV_R.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Heating/OutdoorUnits/Installation%20Pictures/ERGA-EV_ip1.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Heating/OutdoorUnits/Installation%20Pictures/ERGA-EV_ip2.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Heating/OutdoorUnits/Installation%20Pictures/ERGA-EV_ip3.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
  "FCAG-B": [
    "https://www.daikin.lv/content/dam/MDM/Pictures/SkyAir/IndoorUnits/Packshots/FCAG-B.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Accessories/Controls/Packshots/BRC1H51W.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
    "https://www.daikin.lv/content/dam/MDM/Pictures/Accessories/Controls/Packshots/BRC1H51K.tif/_jcr_content/renditions/cq5dam.thumbnail.319.319.png",
  ],
};

const features = {
  "FTXM-R": [
    "lv:Inverters tehnoloģija A+++ efektivitāte",
    "lv:Ultra klusa darbība no 19 dBA",
    "lv:Flash Streamer gaisa attīrīšana",
    "lv:Kustības sensors ar divām zonām",
    "lv:Wi-Fi vadība ar Daikin Onecta lietotni",
    "ru:Инверторная технология класс A+++",
    "ru:Сверхтихая работа от 19 дБА",
    "ru:Очистка воздуха Flash Streamer",
    "ru:Двухзонный датчик движения",
    "ru:Wi-Fi управление через Daikin Onecta",
    "en:Inverter technology A+++ efficiency",
    "en:Ultra-quiet operation from 19 dBA",
    "en:Flash Streamer air purification",
    "en:Dual-zone motion sensor",
    "en:Wi-Fi control via Daikin Onecta app",
  ],
  "FTXTP-N": [
    "lv:Apsildes garantija līdz -30°C āra temperatūrai",
    "lv:A++ energoefektivitātes klase",
    "lv:3D gaisa plūsma ar vertikālu un horizontālu svārsta režīmu",
    "lv:Kompakts dizains, piemērots renovācijai",
    "lv:Balss vadība ar Amazon Alexa un Google Assistant",
    "ru:Отопление при температуре до -30°C",
    "ru:Класс энергоэффективности A++",
    "ru:3D поток воздуха с вертикальными и горизонтальными жалюзи",
    "ru:Компактный дизайн для реновации",
    "ru:Голосовое управление Alexa и Google Assistant",
    "en:Heating guaranteed down to -30°C outdoor temperature",
    "en:A++ energy efficiency class",
    "en:3D airflow with vertical and horizontal auto-swing",
    "en:Compact design suitable for renovations",
    "en:Voice control via Amazon Alexa and Google Assistant",
  ],
  "FTXJ-AW": [
    "lv:Coanda efekts optimālai gaisa izplatīšanai",
    "lv:Ultra klusa darbība 19 dBA",
    "lv:Flash Streamer tehnoloģija pret alerģēniem",
    "lv:Heat boost sasilda 14% ātrāk",
    "lv:Balss vadība ar Alexa un Google Assistant",
    "ru:Эффект Коанда для оптимального распределения воздуха",
    "ru:Сверхтихая работа 19 дБА",
    "ru:Flash Streamer против аллергенов",
    "ru:Heat boost нагрев на 14% быстрее",
    "ru:Голосовое управление Alexa и Google Assistant",
    "en:Coanda effect for optimal airflow distribution",
    "en:Ultra-quiet 19 dBA operation",
    "en:Flash Streamer technology against allergens",
    "en:Heat boost heats 14% faster",
    "en:Voice control via Alexa and Google Assistant",
  ],
  "FTXJ-AS": [
    "lv:Coanda efekts optimālai gaisa izplatīšanai",
    "lv:Ultra klusa darbība 19 dBA",
    "lv:Flash Streamer tehnoloģija pret alerģēniem",
    "lv:Heat boost sasilda 14% ātrāk",
    "lv:Balss vadība ar Alexa un Google Assistant",
    "ru:Эффект Коанда для оптимального распределения воздуха",
    "ru:Сверхтихая работа 19 дБА",
    "ru:Flash Streamer против аллергенов",
    "ru:Heat boost нагрев на 14% быстрее",
    "ru:Голосовое управление Alexa и Google Assistant",
    "en:Coanda effect for optimal airflow distribution",
    "en:Ultra-quiet 19 dBA operation",
    "en:Flash Streamer technology against allergens",
    "en:Heat boost heats 14% faster",
    "en:Voice control via Alexa and Google Assistant",
  ],
  "FTXJ-AB": [
    "lv:Coanda efekts optimālai gaisa izplatīšanai",
    "lv:Ultra klusa darbība 19 dBA",
    "lv:Flash Streamer tehnoloģija pret alerģēniem",
    "lv:Heat boost sasilda 14% ātrāk",
    "lv:Balss vadība ar Alexa un Google Assistant",
    "ru:Эффект Коанда для оптимального распределения воздуха",
    "ru:Сверхтихая работа 19 дБА",
    "ru:Flash Streamer против аллергенов",
    "ru:Heat boost нагрев на 14% быстрее",
    "ru:Голосовое управление Alexa и Google Assistant",
    "en:Coanda effect for optimal airflow distribution",
    "en:Ultra-quiet 19 dBA operation",
    "en:Flash Streamer technology against allergens",
    "en:Heat boost heats 14% faster",
    "en:Voice control via Alexa and Google Assistant",
  ],
  "FTXZ-N": [
    "lv:3 zonu kustības detektors ar enerģijas taupīšanas režīmu",
    "lv:Integrēta mitrināšana (Ururu) un atmitrināšana (Sarara)",
    "lv:Ultra klusa darbība 19 dBA",
    "lv:Flash Streamer gaisa attīrīšana ar pašattīrošu filtru",
    "lv:Viedā vadība ar Onecta lietotni un balss komandām",
    "ru:3-зонный датчик движения с режимом экономии энергии",
    "ru:Увлажнение (Ururu) и осушение (Sarara) без изменения температуры",
    "ru:Сверхтихая работа 19 дБА",
    "ru:Flash Streamer с самоочищающимся фильтром",
    "ru:Управление через Onecta и голосовые команды",
    "en:3-zone motion detector with energy-saving mode",
    "en:Integrated humidification (Ururu) and dehumidification (Sarara)",
    "en:Ultra-quiet 19 dBA operation",
    "en:Flash Streamer with self-cleaning filter",
    "en:Smart control via Onecta app and voice commands",
  ],
  "FVXM-A": [
    "lv:Grīdas bloks ar ērtu zemās pozīcijas montāžu",
    "lv:Apsildes un dzesēšanas funkcija",
    "lv:Savienojams ar RXTP-N8 un RXM-R ārējiem blokiem",
    "lv:Efektīva siltuma un aukstuma izplatīšana telpā",
    "lv:Klusa darbība ikdienas komfortam",
    "ru:Напольный блок с низкой монтажной позицией",
    "ru:Функции отопления и охлаждения",
    "ru:Совместим с наружными блоками RXTP-N8 и RXM-R",
    "ru:Эффективное распределение тепла и холода в помещении",
    "ru:Тихая работа для повседневного комфорта",
    "en:Floor-mounted unit with low installation position",
    "en:Heating and cooling function",
    "en:Compatible with RXTP-N8 and RXM-R outdoor units",
    "en:Efficient heat and cool distribution throughout the room",
    "en:Quiet operation for everyday comfort",
  ],
  "ERGA-EV": [
    "lv:75% atjaunojamā enerģija no gaisa, tikai 25% elektroenerģija",
    "lv:Darbojas līdz -25°C āra temperatūrai",
    "lv:Par 68% mazāka ietekme uz vidi nekā R-410A sistēmām",
    "lv:Integrēts WLAN modulis attālinātai vadībai",
    "lv:Savietojams ar Onecta lietotni viedai vadībai",
    "ru:75% возобновляемой энергии из воздуха, 25% электричества",
    "ru:Работает при температуре до -25°C",
    "ru:На 68% меньше воздействия на окружающую среду чем R-410A",
    "ru:Встроенный модуль WLAN для дистанционного управления",
    "ru:Совместим с приложением Onecta",
    "en:75% renewable energy from air, only 25% electricity",
    "en:Operates down to -25°C outdoor temperature",
    "en:68% lower environmental impact than R-410A systems",
    "en:Integrated WLAN module for remote control",
    "en:Compatible with Onecta app for smart control",
  ],
  "FCAG-B": [
    "lv:360 gradu gaisa izplatīšana optimālai efektivitātei",
    "lv:R-32 Bluevolution par 68% mazāka ietekme uz vidi",
    "lv:Automātiska filtra tīrīšana katru dienu",
    "lv:Kompakta montāža minimālais augstums 214 mm",
    "lv:Dubultais viedais sensors enerģijas efektivitātei",
    "ru:Распределение воздуха 360 градусов для оптимальной эффективности",
    "ru:R-32 Bluevolution на 68% меньше воздействия на среду",
    "ru:Автоматическая ежедневная очистка фильтра",
    "ru:Компактный монтаж минимальная высота 214 мм",
    "ru:Двойной интеллектуальный датчик для экономии энергии",
    "en:360 degree air distribution for optimal efficiency",
    "en:R-32 Bluevolution 68% lower environmental impact",
    "en:Automatic daily filter self-cleaning",
    "en:Compact installation minimum height 214mm",
    "en:Dual intelligent sensors for energy efficiency",
  ],
};

function imgUrl(series) {
  const imgs = images[series];
  if (imgs.length === 1) return imgs[0];
  return JSON.stringify(imgs);
}

const products = [];

for (const [model, kw, area] of [["FTXM25R",2.5,"20-25"],["FTXM35R",3.5,"30-35"],["FTXM50R",5.0,"40-55"],["FTXM71R",7.1,"55-70"]]) {
  products.push({ name_lv:`Daikin Perfera ${model}`, name_ru:`Daikin Perfera ${model}`, name_en:`Daikin Perfera ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["FTXM-R"], image_url:imgUrl("FTXM-R"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FTXTP25N",2.5,"20-25"],["FTXTP35N",3.5,"30-35"],["FTXTP50N",5.0,"40-55"],["FTXTP71N",7.1,"55-70"]]) {
  products.push({ name_lv:`Daikin Comfora ${model}`, name_ru:`Daikin Comfora ${model}`, name_en:`Daikin Comfora ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A++", features:features["FTXTP-N"], image_url:imgUrl("FTXTP-N"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FTXJ20AW",2.0,"15-20"],["FTXJ25AW",2.5,"20-25"],["FTXJ35AW",3.5,"30-35"],["FTXJ50AW",5.0,"40-50"]]) {
  products.push({ name_lv:`Daikin Emura White ${model}`, name_ru:`Daikin Emura White ${model}`, name_en:`Daikin Emura White ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["FTXJ-AW"], image_url:imgUrl("FTXJ-AW"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FTXJ20AS",2.0,"15-20"],["FTXJ25AS",2.5,"20-25"],["FTXJ35AS",3.5,"30-35"],["FTXJ50AS",5.0,"40-50"]]) {
  products.push({ name_lv:`Daikin Emura Silver ${model}`, name_ru:`Daikin Emura Silver ${model}`, name_en:`Daikin Emura Silver ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["FTXJ-AS"], image_url:imgUrl("FTXJ-AS"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FTXJ20AB",2.0,"15-20"],["FTXJ25AB",2.5,"20-25"],["FTXJ35AB",3.5,"30-35"],["FTXJ50AB",5.0,"40-50"]]) {
  products.push({ name_lv:`Daikin Emura Black ${model}`, name_ru:`Daikin Emura Black ${model}`, name_en:`Daikin Emura Black ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["FTXJ-AB"], image_url:imgUrl("FTXJ-AB"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FTXZ25N",2.5,"20-25"],["FTXZ35N",3.5,"30-35"],["FTXZ50N",5.0,"40-50"],["FTXZ71N",7.1,"55-70"]]) {
  products.push({ name_lv:`Daikin Ururu Sarara ${model}`, name_ru:`Daikin Ururu Sarara ${model}`, name_en:`Daikin Ururu Sarara ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["FTXZ-N"], image_url:imgUrl("FTXZ-N"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FVXM25A",2.5,"20-25"],["FVXM35A",3.5,"30-35"],["FVXM50A",5.0,"40-55"]]) {
  products.push({ name_lv:`Daikin Perfera Floor ${model}`, name_ru:`Daikin Perfera Floor ${model}`, name_en:`Daikin Perfera Floor ${model}`, brand:"Daikin", price:0, install_price:249, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["FVXM-A"], image_url:imgUrl("FVXM-A"), category:"home", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["ERGA04EV",4.0,"60-80"],["ERGA06EV",6.0,"80-110"],["ERGA08EV",8.0,"100-140"],["ERGA11EV",11.0,"130-180"],["ERGA16EV",16.0,"170-240"]]) {
  products.push({ name_lv:`Daikin Altherma 3 R ${model}`, name_ru:`Daikin Altherma 3 R ${model}`, name_en:`Daikin Altherma 3 R ${model}`, brand:"Daikin", price:0, install_price:499, power_kw:kw, area_coverage:area, energy_class:"A+++", features:features["ERGA-EV"], image_url:imgUrl("ERGA-EV"), category:"heat_pump", brand_color:"#003087", in_stock:true });
}
for (const [model, kw, area] of [["FCAG35B",3.5,"30-40"],["FCAG50B",5.0,"40-55"],["FCAG71B",7.1,"55-70"],["FCAG100B",10.0,"80-110"]]) {
  products.push({ name_lv:`Daikin Sky Air A-Series ${model}`, name_ru:`Daikin Sky Air A-Series ${model}`, name_en:`Daikin Sky Air A-Series ${model}`, brand:"Daikin", price:0, install_price:399, power_kw:kw, area_coverage:area, energy_class:"A++", features:features["FCAG-B"], image_url:imgUrl("FCAG-B"), category:"commercial", brand_color:"#003087", in_stock:true });
}

console.log(`Total products built: ${products.length}`);

const outPath = "c:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\daikin_products.json";
writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`Saved to ${outPath}`);

// INSERT INTO SUPABASE
const SUPABASE_URL = "https://yoffczlzqpzuejxiskum.supabase.co/rest/v1/products";
const API_KEY = "sb_publishable_hQB36cTxFHLwDkurMyisdA_eDYOoOLt";
const headers = {
  "apikey": API_KEY,
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

let inserted = 0;
let failed = 0;
const failures = [];

for (const product of products) {
  try {
    const res = await fetch(SUPABASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(product),
    });
    if (res.status === 201 || res.status === 200) {
      inserted++;
      process.stdout.write(`  OK  ${product.name_en}\n`);
    } else {
      const text = await res.text();
      failed++;
      failures.push({ name: product.name_en, status: res.status, body: text });
      process.stdout.write(`  FAIL [${res.status}] ${product.name_en}: ${text.slice(0, 200)}\n`);
    }
  } catch (err) {
    failed++;
    failures.push({ name: product.name_en, error: err.message });
    process.stdout.write(`  ERR  ${product.name_en}: ${err.message}\n`);
  }
}

console.log(`\n========================================`);
console.log(`Inserted: ${inserted}  /  Failed: ${failed}  /  Total: ${products.length}`);
if (failures.length > 0) {
  console.log("\nFailures detail:");
  for (const f of failures) console.log(`  - ${f.name}: HTTP ${f.status || 'ERR'} ${f.body || f.error || ''}`);
}
