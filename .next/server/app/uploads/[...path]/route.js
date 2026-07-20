"use strict";(()=>{var e={};e.id=450,e.ids=[450],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},37267:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>d,patchFetch:()=>O,requestAsyncStorage:()=>N,routeModule:()=>L,serverHooks:()=>U,staticGenerationAsyncStorage:()=>_});var n={};t.r(n),t.d(n,{GET:()=>c,dynamic:()=>u});var i=t(49303),a=t(88716),T=t(60670),E=t(57147),s=t(71017),o=t.n(s),p=t(75748);let u="force-dynamic",l={".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".gif":"image/gif",".svg":"image/svg+xml",".avif":"image/avif"};async function c(e,{params:r}){let t;let{path:n}=await r,i=n.join("/");if(i.includes("..")||i.includes("\0"))return new Response("Bad request",{status:400});let a=o().join(p.MF,i);try{t=await E.promises.readFile(a)}catch{return new Response("Not found",{status:404})}let T=l[o().extname(a).toLowerCase()]??"application/octet-stream";return new Response(new Uint8Array(t),{headers:{"Content-Type":T,"Cache-Control":"public, max-age=31536000, immutable"}})}let L=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/uploads/[...path]/route",pathname:"/uploads/[...path]",filename:"route",bundlePath:"app/uploads/[...path]/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\uploads\\[...path]\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:N,staticGenerationAsyncStorage:_,serverHooks:U}=L,d="/uploads/[...path]/route";function O(){return(0,T.patchFetch)({serverHooks:U,staticGenerationAsyncStorage:_})}},49303:(e,r,t)=>{e.exports=t(30517)},75748:(e,r,t)=>{t.d(r,{G$:()=>g,GK:()=>P,GL:()=>S,Gw:()=>F,Ir:()=>v,LH:()=>W,MF:()=>p,OV:()=>B,RN:()=>I,Rf:()=>C,Vr:()=>b,Wv:()=>y,XU:()=>M,Y6:()=>q,c0:()=>X,db:()=>c,f1:()=>$,f5:()=>G,fd:()=>k,g8:()=>x,i0:()=>w,jd:()=>h,my:()=>H,nM:()=>D,rE:()=>Y,ry:()=>f,sJ:()=>j,tr:()=>R,vb:()=>V,wv:()=>A});var n=t(55467),i=t(71017),a=t.n(i),T=t(57147),E=t.n(T),s=t(6113);let o=process.env.DATA_DIR||a().join(process.cwd(),"data"),p=a().join(o,"uploads"),u=`
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
`,l=globalThis;function c(){if(!l.__aircomfortDb){E().mkdirSync(o,{recursive:!0});let e=new n.DatabaseSync(a().join(o,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(u),l.__aircomfortDb=e}return l.__aircomfortDb}let L=e=>1===e||!0===e;function N(e){let r;if(e.specs)try{r=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:r,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let _=e=>({...e,is_visible:L(e.is_visible)}),U=e=>({...e,is_visible:L(e.is_visible)}),d=e=>({...e,is_active:L(e.is_active)}),O=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function m(e){let r={};for(let t of O){if(!(t in e))continue;let n=e[t];"features"===t?r[t]=JSON.stringify(n??[]):"specs"===t?r[t]=n?JSON.stringify(n):null:"boolean"==typeof n?r[t]=n?1:0:r[t]=n??null}return r}async function R(e={}){let r=e.inStockOnly?"WHERE in_stock = 1":"",t="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return c().prepare(`SELECT * FROM products ${r} ${t}`).all().map(N)}async function A(e){let r=c().prepare("SELECT * FROM products WHERE id = ?").get(e);return r?N(r):null}async function f(e){let r=m(e),t=(0,s.randomUUID)(),n=Object.keys(r);return c().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(t,...n.map(e=>r[e])),await A(t)}async function D(e,r){let t=m(r),n=Object.keys(t);return n.length&&c().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>t[e]),e),A(e)}async function v(e){c().prepare("DELETE FROM products WHERE id = ?").run(e)}async function F(){let e={};for(let r of c().prepare("SELECT key, value FROM settings").all())e[r.key]=r.value;return e}async function g(){return c().prepare("SELECT key, value FROM settings").all()}async function y(e){let r=c().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:t,value:n}of e)r.run(t,String(n??""))}async function S(){return c().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function h(){return c().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(U)}async function I(e,r){c().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,r)}async function X(e,r){void 0!==r.sort_order&&c().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(r.sort_order,e),void 0!==r.is_visible&&c().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(r.is_visible?1:0,e)}async function b(e){c().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function C(e={}){let r=e.visibleOnly?"WHERE is_visible = 1":"",t=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return c().prepare(`SELECT * FROM reviews ${r} ORDER BY created_at DESC ${t}`).all().map(_)}async function M(e){c().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function x(e,r){let t=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===r[e])continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&c().prepare(`UPDATE reviews SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function w(e){c().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function k(){return c().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Y(e){c().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function H(e,r){c().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(r,e)}async function P(e){c().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function j(){return c().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(d)}async function G(e){let r=c().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return r?d(r):null}async function W(e){c().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,s.randomUUID)(),String(e.slug??""),(0,s.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function B(e,r){let t=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in r))continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&c().prepare(`UPDATE employees_cards SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function $(e){c().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function q(e){let r=c().prepare("SELECT value FROM auth WHERE key = ?").get(e);return r?r.value:null}function V(e,r){c().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,r)}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[948],()=>t(37267));module.exports=n})();