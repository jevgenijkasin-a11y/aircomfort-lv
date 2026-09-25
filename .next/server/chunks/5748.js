"use strict";exports.id=5748,exports.ids=[5748],exports.modules={67820:(e,i,t)=>{t.d(i,{EQ:()=>E,J:()=>r,LO:()=>l,P:()=>s,bX:()=>o,if:()=>T,lV:()=>u,m:()=>n,ox:()=>c});let r="fan_coils_ducted",s="commercial_heat_pump",n=(e,i)=>e[`name_${i}`]||e.name_ru||e.name_lv||e.name_en||e.key,a=e=>new Map(e.map(e=>[e.key,e]));function o(e,i){let t=new Set([i]),r=!0;for(;r;)for(let i of(r=!1,e))i.parent_key&&t.has(i.parent_key)&&!t.has(i.key)&&(t.add(i.key),r=!0);return t}function l(e,i,t){let r=a(e),s=i;for(let e=0;s&&e<10;e++){if(s===t)return!0;s=r.get(s)?.parent_key}return!1}let T=(e,i)=>l(e,i,"fan_coils");function E(e){let i=new Set;for(let t of e)t.is_visible||o(e,t.key).forEach(e=>i.add(e));return i}function u(e){let i={ā:"a",č:"c",ē:"e",ģ:"g",ī:"i",ķ:"k",ļ:"l",ņ:"n",š:"s",ū:"u",ž:"z",а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};return e.toLowerCase().split("").map(e=>i[e]??e).join("").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)}let c=/^[a-z0-9]+(?:-[a-z0-9]+)*$/},75748:(e,i,t)=>{t.d(i,{Ao:()=>I,G$:()=>Y,GK:()=>ee,GL:()=>x,Gw:()=>H,Ir:()=>k,LH:()=>er,MF:()=>u,OM:()=>X,OV:()=>es,RN:()=>W,Rf:()=>z,Vr:()=>B,Wv:()=>$,XU:()=>K,Y6:()=>ea,c0:()=>P,db:()=>L,f1:()=>en,f5:()=>et,fd:()=>Z,g8:()=>V,i0:()=>J,jd:()=>G,k4:()=>C,kb:()=>S,my:()=>q,n3:()=>b,nM:()=>D,rE:()=>Q,ry:()=>y,sJ:()=>ei,tr:()=>R,uu:()=>j,vb:()=>eo,wv:()=>g,yr:()=>w});var r=t(55467),s=t(71017),n=t.n(s),a=t(57147),o=t.n(a),l=t(6113),T=t(67820);let E=process.env.DATA_DIR||n().join(process.cwd(),"data"),u=n().join(E,"uploads"),c=`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name_lv TEXT NOT NULL DEFAULT '',
  name_ru TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  install_price REAL NOT NULL DEFAULT 0,
  power_kw REAL NOT NULL DEFAULT 0,
  area_coverage TEXT NOT NULL DEFAULT '',
  energy_class TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'home',
  brand_color TEXT NOT NULL DEFAULT '',
  in_stock INTEGER NOT NULL DEFAULT 1,
  is_hit INTEGER NOT NULL DEFAULT 0,
  is_promo INTEGER NOT NULL DEFAULT 0,
  discount_percent REAL,
  description_lv TEXT NOT NULL DEFAULT '',
  description_ru TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  specs TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL DEFAULT '',
  text_lv TEXT NOT NULL DEFAULT '',
  text_ru TEXT NOT NULL DEFAULT '',
  text_en TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS employees_cards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  photo_position INTEGER NOT NULL DEFAULT 50,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS auth (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`,_=globalThis;function L(){if(!_.__aircomfortDb){o().mkdirSync(E,{recursive:!0});let e=new r.DatabaseSync(n().join(E,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(c),function(e){let i=e.prepare("PRAGMA table_info(products)").all().map(e=>e.name);i.includes("updated_at")||(e.exec("ALTER TABLE products ADD COLUMN updated_at TEXT"),e.exec("UPDATE products SET updated_at = created_at WHERE updated_at IS NULL"));let t=Number(e.prepare("PRAGMA user_version").get()?.user_version??0);if(t<1){(function(e,i){if(!(Number(e.prepare("SELECT COUNT(*) n FROM products").get()?.n??0)>0))return;let t=new Date().toISOString().replace(/[:.]/g,"-"),r=n().join(E,`aircomfort.db.bak-v${i}-${t}`);e.prepare("VACUUM INTO ?").run(r),console.log(`[db] backup before migration written to ${r}`)})(e,t),e.exec("BEGIN");try{(function(e,i){e.exec(`
CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  parent_key TEXT,
  slug TEXT NOT NULL UNIQUE,
  name_lv TEXT NOT NULL DEFAULT '',
  name_ru TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  is_system INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  seo_title_lv TEXT NOT NULL DEFAULT '', seo_title_ru TEXT NOT NULL DEFAULT '', seo_title_en TEXT NOT NULL DEFAULT '',
  seo_description_lv TEXT NOT NULL DEFAULT '', seo_description_ru TEXT NOT NULL DEFAULT '', seo_description_en TEXT NOT NULL DEFAULT '',
  seo_h1_lv TEXT NOT NULL DEFAULT '', seo_h1_ru TEXT NOT NULL DEFAULT '', seo_h1_en TEXT NOT NULL DEFAULT '',
  seo_intro_lv TEXT NOT NULL DEFAULT '', seo_intro_ru TEXT NOT NULL DEFAULT '', seo_intro_en TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);`),i.includes("compatible_ids")||e.exec("ALTER TABLE products ADD COLUMN compatible_ids TEXT NOT NULL DEFAULT '[]'");let t=e.prepare(`INSERT OR IGNORE INTO categories
    (key, parent_key, slug, name_lv, name_ru, name_en, sort_order, is_visible, is_system,
     seo_title_lv, seo_title_ru, seo_title_en, seo_description_lv, seo_description_ru, seo_description_en,
     seo_h1_lv, seo_h1_ru, seo_h1_en, seo_intro_lv, seo_intro_ru, seo_intro_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let e of d)t.run(e.key,e.parent??null,e.slug,e.lv,e.ru,e.en,e.sort,e.visible?1:0,e.system?1:0,e.seo?.title.lv??"",e.seo?.title.ru??"",e.seo?.title.en??"",e.seo?.desc.lv??"",e.seo?.desc.ru??"",e.seo?.desc.en??"",e.seo?.h1.lv??"",e.seo?.h1.ru??"",e.seo?.h1.en??"",e.seo?.intro.lv??"",e.seo?.intro.ru??"",e.seo?.intro.en??"")})(e,i),e.exec("PRAGMA user_version = 1"),e.exec("COMMIT")}catch(i){throw e.exec("ROLLBACK"),i}}}(e),_.__aircomfortDb=e}return _.__aircomfortDb}let p=(e,i,t,r,s,n)=>({title:{lv:`${e} — cenas un montāža`,ru:`${i} — цены и монтаж`,en:`${t} — prices & installation`},desc:{lv:`${e} ūdens apkures un dzesēšanas sistēmām ar siltumsūkni gaiss-ūdens. Izvēle pēc jaudas, montāža visā Latvijā, bezmaksas konsultācija.`,ru:`${i} для водяных систем отопления и охлаждения с тепловым насосом воздух-вода. Подбор по мощности, монтаж по всей Латвии, бесплатная консультация.`,en:`${t} for hydronic heating and cooling with an air-to-water heat pump. Sized to your rooms, installed anywhere in Latvia, free advice.`},h1:{lv:e,ru:i,en:t},intro:{lv:r,ru:s,en:n}}),d=[{key:"home",slug:"home-air-conditioners",lv:"Mājas kondicionieri",ru:"Домашние кондиционеры",en:"Home Air Conditioners",sort:10,visible:!0,system:!0},{key:"heat_pump",slug:"air-to-air-heat-pumps",lv:"Siltumsūkņi gaiss-gaiss",ru:"Тепловые насосы воздух-воздух",en:"Heat Pumps Air-to-Air",sort:20,visible:!0,system:!0},{key:"commercial",slug:"commercial-air-conditioning",lv:"Komerciālā klimatizācija",ru:"Промышленная климатизация",en:"Commercial HVAC",sort:30,visible:!0,system:!0},{key:"commercial_heat_pump",slug:"air-to-water-heat-pumps",lv:"Siltumsūkņi gaiss-ūdens",ru:"Тепловые насосы воздух-вода",en:"Heat Pumps Air-to-Water",sort:40,visible:!0,system:!0},{key:"fan_coils",slug:"fan-coils",lv:"Fankoili",ru:"Фанкоилы",en:"Fan coil units",sort:50,visible:!1,seo:p("Fankoili","Фанкоилы","Fan coil units","Fankoils ir iekšējais bloks, kas silda vai dzesē telpu ar ūdeni no siltumsūkņa gaiss-ūdens vai katla. Piedāvājam kasešu, kanālu, sienas un grīdas-griestu modeļus 2 un 4 cauruļu sistēmām.","Фанкойл — внутренний блок, который обогревает или охлаждает помещение водой от теплового насоса воздух-вода или котла. Подберём кассетные, канальные, настенные и напольно-потолочные модели для 2- и 4-трубных систем.","A fan coil is an indoor unit that heats or cools a room with water from an air-to-water heat pump or boiler. We supply cassette, ducted, wall-mounted and floor-ceiling models for 2- and 4-pipe systems.")},{key:"fan_coils_cassette",parent:"fan_coils",slug:"fan-coils-cassette",lv:"Kasešu",ru:"Кассетные",en:"Cassette",sort:10,visible:!0,seo:p("Kasešu fankoili","Кассетные фанкоилы","Cassette fan coils","Kasešu fankoili tiek iebūvēti piekaramajos griestos un vienmērīgi sadala gaisu četros virzienos — piemēroti birojiem, veikaliem un plašām telpām.","Кассетные фанкойлы встраиваются в подвесной потолок и равномерно распределяют воздух в четыре стороны — подходят для офисов, магазинов и больших помещений.","Cassette fan coils are built into suspended ceilings and spread air evenly in four directions — a good fit for offices, shops and large rooms.")},{key:"fan_coils_ducted",parent:"fan_coils",slug:"fan-coils-ducted",lv:"Kanālu",ru:"Канальные",en:"Ducted",sort:20,visible:!0,seo:p("Kanālu fankoili","Канальные фанкоилы","Ducted fan coils","Kanālu fankoili tiek paslēpti aiz griestiem, un gaiss pa kanāliem tiek novadīts uz vienu vai vairākām telpām. Svarīgs parametrs ir ārējais statiskais spiediens.","Канальные фанкойлы прячутся за потолком, а воздух по воздуховодам подаётся в одно или несколько помещений. Важный параметр — внешний статический напор.","Ducted fan coils are hidden above the ceiling and deliver air through ducts to one or several rooms. External static pressure is the key parameter.")},{key:"fan_coils_wall",parent:"fan_coils",slug:"fan-coils-wall",lv:"Sienas",ru:"Настенные",en:"Wall-mounted",sort:30,visible:!0,seo:p("Sienas fankoili","Настенные фанкоилы","Wall-mounted fan coils","Sienas fankoili izskatās kā parasta sadalītās sistēmas iekšējā iekārta un ir vienkāršākais risinājums dzīvokļiem un mājām ar siltumsūkni gaiss-ūdens.","Настенные фанкойлы похожи на внутренний блок обычной сплит-системы — самое простое решение для квартир и домов с тепловым насосом воздух-вода.","Wall-mounted fan coils look like a regular split-system indoor unit — the simplest option for flats and houses with an air-to-water heat pump.")},{key:"fan_coils_floor_ceiling",parent:"fan_coils",slug:"fan-coils-floor-ceiling",lv:"Grīdas-griestu",ru:"Напольно-потолочные",en:"Floor-ceiling",sort:40,visible:!0,seo:p("Grīdas-griestu fankoili","Напольно-потолочные фанкоилы","Floor-ceiling fan coils","Grīdas-griestu fankoilus var uzstādīt pie sienas pie grīdas vai zem griestiem — universāls variants telpām bez piekaramajiem griestiem.","Напольно-потолочные фанкойлы можно установить у пола или под потолком — универсальный вариант для помещений без подвесного потолка.","Floor-ceiling fan coils can be mounted low on the wall or under the ceiling — a versatile choice for rooms without a suspended ceiling.")}],N=e=>1===e||!0===e;function m(e){let i;if(e.specs)try{i=JSON.parse(e.specs)}catch{}let t=[];try{t=JSON.parse(e.compatible_ids||"[]")}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:i,compatible_ids:t,in_stock:N(e.in_stock),is_hit:N(e.is_hit),is_promo:N(e.is_promo)}}let U=e=>({...e,is_visible:N(e.is_visible)}),f=e=>({...e,is_visible:N(e.is_visible)}),O=e=>({...e,is_active:N(e.is_active)}),A=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs","compatible_ids"];function v(e){let i={};for(let t of A){if(!(t in e))continue;let r=e[t];"features"===t||"compatible_ids"===t?i[t]=JSON.stringify(Array.isArray(r)?r:[]):"specs"===t?i[t]=r?JSON.stringify(r):null:"boolean"==typeof r?i[t]=r?1:0:i[t]=r??null}return i}async function R(e={}){let i=e.inStockOnly?"WHERE in_stock = 1":"",t="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return L().prepare(`SELECT * FROM products ${i} ${t}`).all().map(m)}async function g(e){let i=L().prepare("SELECT * FROM products WHERE id = ?").get(e);return i?m(i):null}async function y(e){let i=v(e),t=(0,l.randomUUID)();i.updated_at=new Date().toISOString();let r=Object.keys(i);return L().prepare(`INSERT INTO products (id${r.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(r.length)})`).run(t,...r.map(e=>i[e])),await g(t)}async function D(e,i){let t=v(i);Object.keys(t).length&&(t.updated_at=new Date().toISOString());let r=Object.keys(t);return r.length&&L().prepare(`UPDATE products SET ${r.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...r.map(e=>t[e]),e),g(e)}async function k(e){L().prepare("DELETE FROM products WHERE id = ?").run(e)}let F=e=>({...e,is_visible:N(e.is_visible),is_system:N(e.is_system)}),h=["parent_key","slug","name_lv","name_ru","name_en","sort_order","is_visible","image_url","seo_title_lv","seo_title_ru","seo_title_en","seo_description_lv","seo_description_ru","seo_description_en","seo_h1_lv","seo_h1_ru","seo_h1_en","seo_intro_lv","seo_intro_ru","seo_intro_en"];function S(){return L().prepare("SELECT * FROM categories ORDER BY sort_order, key").all().map(F)}function b(e){let i=L().prepare("SELECT * FROM categories WHERE key = ?").get(e);return i?F(i):null}function I(){let e={};for(let i of L().prepare("SELECT category, COUNT(*) n FROM products GROUP BY category").all())e[i.category]=Number(i.n);return e}function X(){return(0,T.EQ)(S())}function M(e){let i={};for(let t of h){if(!(t in e))continue;let r=e[t];"is_visible"===t?i[t]=r?1:0:"sort_order"===t?i[t]=Number(r)||0:"parent_key"===t?i[t]=r||null:i[t]=String(r??"")}return i}function C(e,i){let t=M(i),r=Object.keys(t);return L().prepare(`INSERT INTO categories (key${r.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(r.length)})`).run(e,...r.map(e=>t[e])),b(e)}function w(e,i){let t=M(i),r=Object.keys(t);return r.length&&L().prepare(`UPDATE categories SET ${r.map(e=>`${e} = ?`).join(", ")} WHERE key = ?`).run(...r.map(e=>t[e]),e),b(e)}function j(e){L().prepare("DELETE FROM categories WHERE key = ? AND is_system = 0").run(e)}async function H(){let e={};for(let i of L().prepare("SELECT key, value FROM settings").all())e[i.key]=i.value;return e}async function Y(){return L().prepare("SELECT key, value FROM settings").all()}async function $(e){let i=L().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:t,value:r}of e)i.run(t,String(r??""))}async function x(){return L().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function G(){return L().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(f)}async function W(e,i){L().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,i)}async function P(e,i){void 0!==i.sort_order&&L().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(i.sort_order,e),void 0!==i.is_visible&&L().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(i.is_visible?1:0,e)}async function B(e){L().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function z(e={}){let i=e.visibleOnly?"WHERE is_visible = 1":"",t=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return L().prepare(`SELECT * FROM reviews ${i} ORDER BY created_at DESC ${t}`).all().map(U)}async function K(e){L().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function V(e,i){let t=[],r=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===i[e])continue;t.push(`${e} = ?`);let s=i[e];r.push("boolean"==typeof s?s?1:0:s)}t.length&&L().prepare(`UPDATE reviews SET ${t.join(", ")} WHERE id = ?`).run(...r,e)}async function J(e){L().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function Z(){return L().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Q(e){L().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function q(e,i){L().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(i,e)}async function ee(e){L().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function ei(){return L().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(O)}async function et(e){let i=L().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return i?O(i):null}async function er(e){L().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,l.randomUUID)(),String(e.slug??""),(0,l.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function es(e,i){let t=[],r=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in i))continue;t.push(`${e} = ?`);let s=i[e];r.push("boolean"==typeof s?s?1:0:s)}t.length&&L().prepare(`UPDATE employees_cards SET ${t.join(", ")} WHERE id = ?`).run(...r,e)}async function en(e){L().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function ea(e){let i=L().prepare("SELECT value FROM auth WHERE key = ?").get(e);return i?i.value:null}function eo(e,i){L().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,i)}}};