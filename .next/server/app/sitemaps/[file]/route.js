"use strict";(()=>{var e={};e.id=774,e.ids=[774],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},57146:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>L,patchFetch:()=>d,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>p});var a={};r.r(a),r.d(a,{GET:()=>E,dynamic:()=>T});var n=r(49303),i=r(88716),o=r(60670),s=r(20442);let T="force-dynamic";async function E(e,{params:t}){let{file:r}=await t,a=r.replace(/\.xml$/,"");return r.endsWith(".xml")&&s.nq.includes(a)?new Response((0,s.hL)(await (0,s.Kw)(a)),{headers:s.AO}):new Response("Not found",{status:404})}let l=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/sitemaps/[file]/route",pathname:"/sitemaps/[file]",filename:"route",bundlePath:"app/sitemaps/[file]/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\sitemaps\\[file]\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:c,staticGenerationAsyncStorage:p,serverHooks:u}=l,L="/sitemaps/[file]/route";function d(){return(0,o.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:p})}},49303:(e,t,r)=>{e.exports=r(30517)},25866:(e,t,r)=>{r.d(t,{Cz:()=>a,IL:()=>i,pP:()=>n});let a=24,n={"1719d7c0-0070-473d-907f-7e7d542eafba":"76662679-b614-4719-a279-49bb3f67acc8"},i=e=>e.filter(e=>!n[e.id])},75748:(e,t,r)=>{r.d(t,{G$:()=>g,GK:()=>Y,GL:()=>F,Gw:()=>D,Ir:()=>h,LH:()=>W,MF:()=>l,OV:()=>j,RN:()=>I,Rf:()=>x,Vr:()=>b,Wv:()=>v,XU:()=>$,Y6:()=>B,c0:()=>X,db:()=>u,f1:()=>G,f5:()=>q,fd:()=>C,g8:()=>w,i0:()=>M,jd:()=>S,my:()=>P,nM:()=>y,rE:()=>k,ry:()=>R,sJ:()=>H,tr:()=>O,vb:()=>K,wv:()=>A});var a=r(55467),n=r(71017),i=r.n(n),o=r(57147),s=r.n(o),T=r(6113);let E=process.env.DATA_DIR||i().join(process.cwd(),"data"),l=i().join(E,"uploads"),c=`
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
`,p=globalThis;function u(){if(!p.__aircomfortDb){s().mkdirSync(E,{recursive:!0});let e=new a.DatabaseSync(i().join(E,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(c),e.prepare("PRAGMA table_info(products)").all().map(e=>e.name).includes("updated_at")||(e.exec("ALTER TABLE products ADD COLUMN updated_at TEXT"),e.exec("UPDATE products SET updated_at = created_at WHERE updated_at IS NULL")),p.__aircomfortDb=e}return p.__aircomfortDb}let L=e=>1===e||!0===e;function d(e){let t;if(e.specs)try{t=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:t,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let N=e=>({...e,is_visible:L(e.is_visible)}),m=e=>({...e,is_visible:L(e.is_visible)}),_=e=>({...e,is_active:L(e.is_active)}),U=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function f(e){let t={};for(let r of U){if(!(r in e))continue;let a=e[r];"features"===r?t[r]=JSON.stringify(a??[]):"specs"===r?t[r]=a?JSON.stringify(a):null:"boolean"==typeof a?t[r]=a?1:0:t[r]=a??null}return t}async function O(e={}){let t=e.inStockOnly?"WHERE in_stock = 1":"",r="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return u().prepare(`SELECT * FROM products ${t} ${r}`).all().map(d)}async function A(e){let t=u().prepare("SELECT * FROM products WHERE id = ?").get(e);return t?d(t):null}async function R(e){let t=f(e),r=(0,T.randomUUID)();t.updated_at=new Date().toISOString();let a=Object.keys(t);return u().prepare(`INSERT INTO products (id${a.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(a.length)})`).run(r,...a.map(e=>t[e])),await A(r)}async function y(e,t){let r=f(t);Object.keys(r).length&&(r.updated_at=new Date().toISOString());let a=Object.keys(r);return a.length&&u().prepare(`UPDATE products SET ${a.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...a.map(e=>r[e]),e),A(e)}async function h(e){u().prepare("DELETE FROM products WHERE id = ?").run(e)}async function D(){let e={};for(let t of u().prepare("SELECT key, value FROM settings").all())e[t.key]=t.value;return e}async function g(){return u().prepare("SELECT key, value FROM settings").all()}async function v(e){let t=u().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:r,value:a}of e)t.run(r,String(a??""))}async function F(){return u().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function S(){return u().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(m)}async function I(e,t){u().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,t)}async function X(e,t){void 0!==t.sort_order&&u().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(t.sort_order,e),void 0!==t.is_visible&&u().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(t.is_visible?1:0,e)}async function b(e){u().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function x(e={}){let t=e.visibleOnly?"WHERE is_visible = 1":"",r=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return u().prepare(`SELECT * FROM reviews ${t} ORDER BY created_at DESC ${r}`).all().map(N)}async function $(e){u().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function w(e,t){let r=[],a=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===t[e])continue;r.push(`${e} = ?`);let n=t[e];a.push("boolean"==typeof n?n?1:0:n)}r.length&&u().prepare(`UPDATE reviews SET ${r.join(", ")} WHERE id = ?`).run(...a,e)}async function M(e){u().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function C(){return u().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function k(e){u().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function P(e,t){u().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(t,e)}async function Y(e){u().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function H(){return u().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(_)}async function q(e){let t=u().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return t?_(t):null}async function W(e){u().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,T.randomUUID)(),String(e.slug??""),(0,T.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function j(e,t){let r=[],a=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in t))continue;r.push(`${e} = ?`);let n=t[e];a.push("boolean"==typeof n?n?1:0:n)}r.length&&u().prepare(`UPDATE employees_cards SET ${r.join(", ")} WHERE id = ?`).run(...a,e)}async function G(e){u().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function B(e){let t=u().prepare("SELECT value FROM auth WHERE key = ?").get(e);return t?t.value:null}function K(e,t){u().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,t)}},35168:(e,t,r)=>{r.d(t,{_:()=>a,l:()=>i});let a="https://aircomfort.lv",n=["lv","ru","en"];function i(e,t=""){let r=t&&!t.startsWith("/")?`/${t}`:t,i={};for(let e of n)i[e]=`${a}/${e}${r}`;return i["x-default"]=`${a}/lv${r}`,{canonical:`${a}/${e}${r}`,languages:i}}},20442:(e,t,r)=>{r.d(t,{AO:()=>d,Gk:()=>L,Kw:()=>c,hL:()=>u,nq:()=>s});var a=r(75748),n=r(25866),i=r(35168),o=r(9551);let s=["lv","ru","en"],T=[{path:"",lastmod:"2026-07-08",priority:1,changefreq:"weekly"},{path:"/calculator",lastmod:"2026-07-20",priority:.7,changefreq:"monthly"},{path:"/contacts",lastmod:"2026-07-20",priority:.7,changefreq:"monthly"},{path:"/privacy",lastmod:"2026-05-13",priority:.3,changefreq:"yearly"}],E=e=>e?e.slice(0,10):void 0,l=e=>e.filter(Boolean).sort().at(-1)??"2026-07-08";async function c(e){let t=(0,n.IL)(await (0,a.tr)({inStockOnly:!0})),r=e=>E(e.updated_at)??E(e.created_at),s=`${i._}/${e}`,c=T.map(e=>({loc:`${s}${e.path}`,lastmod:e.lastmod,priority:e.priority,changefreq:e.changefreq}));c.push({loc:`${s}/catalog`,lastmod:l(t.map(r)),priority:.9,changefreq:"weekly"});let p=new Map;for(let e of t)p.set(e.brand,[...p.get(e.brand)??[],e]);for(let[e,t]of p)c.push({loc:`${s}/catalog/brand/${(0,o.eP)(e)}`,lastmod:l(t.map(r)),priority:.8,changefreq:"weekly"});for(let[e,a]of Object.entries(o.j4)){let n=t.filter(t=>t.category===e);n.length&&c.push({loc:`${s}/catalog/type/${a}`,lastmod:l(n.map(r)),priority:.8,changefreq:"weekly"})}for(let e of t)c.push({loc:`${s}/catalog/${e.id}`,lastmod:r(e),priority:.6,changefreq:"monthly"});return c}let p=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");function u(e){let t=e.map(e=>`<url><loc>${p(e.loc)}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`).join("\n");return`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${t}
</urlset>
`}function L(e){let t=e.map(e=>`<sitemap><loc>${p(e.loc)}</loc><lastmod>${e.lastmod}</lastmod></sitemap>`).join("\n");return`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${t}
</sitemapindex>
`}let d={"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=3600"}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,9551],()=>r(57146));module.exports=a})();