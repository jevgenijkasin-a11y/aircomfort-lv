"use strict";(()=>{var e={};e.id=3497,e.ids=[3497],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},49134:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>l,patchFetch:()=>N,requestAsyncStorage:()=>L,routeModule:()=>c,serverHooks:()=>p,staticGenerationAsyncStorage:()=>u});var n={};r.r(n),r.d(n,{GET:()=>s,dynamic:()=>o});var i=r(49303),a=r(88716),T=r(60670),E=r(75748);let o="force-dynamic";async function s(e,{params:t}){let{token:r}=await t,n=await (0,E.f5)(r);return n?new Response(["BEGIN:VCARD","VERSION:3.0",`FN:${n.name}`,"ORG:AirComfort",`TITLE:${n.title}`,`TEL;TYPE=CELL:${n.phone}`,`EMAIL:${n.email}`,"URL:https://aircomfort.lv",n.photo_url?`PHOTO;VALUE=URI:${n.photo_url.startsWith("/")?`https://aircomfort.lv${n.photo_url}`:n.photo_url}`:"","END:VCARD"].filter(Boolean).join("\r\n"),{headers:{"Content-Type":"text/vcard; charset=utf-8","Content-Disposition":`attachment; filename="${n.slug}.vcf"`}}):new Response("Not found",{status:404})}let c=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/card/[token]/vcard/route",pathname:"/card/[token]/vcard",filename:"route",bundlePath:"app/card/[token]/vcard/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\card\\[token]\\vcard\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:L,staticGenerationAsyncStorage:u,serverHooks:p}=c,l="/card/[token]/vcard/route";function N(){return(0,T.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:u})}},49303:(e,t,r)=>{e.exports=r(30517)},75748:(e,t,r)=>{r.d(t,{G$:()=>F,GK:()=>H,GL:()=>I,Gw:()=>S,Ir:()=>v,LH:()=>W,MF:()=>c,OV:()=>j,RN:()=>g,Rf:()=>M,Vr:()=>C,Wv:()=>y,XU:()=>b,Y6:()=>V,c0:()=>X,db:()=>p,f1:()=>B,f5:()=>$,fd:()=>w,g8:()=>k,i0:()=>x,jd:()=>h,my:()=>P,nM:()=>D,rE:()=>Y,ry:()=>f,sJ:()=>G,tr:()=>R,vb:()=>q,wv:()=>m});var n=r(55467),i=r(71017),a=r.n(i),T=r(57147),E=r.n(T),o=r(6113);let s=process.env.DATA_DIR||a().join(process.cwd(),"data"),c=a().join(s,"uploads"),L=`
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
`,u=globalThis;function p(){if(!u.__aircomfortDb){E().mkdirSync(s,{recursive:!0});let e=new n.DatabaseSync(a().join(s,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(L),e.prepare("PRAGMA table_info(products)").all().map(e=>e.name).includes("updated_at")||(e.exec("ALTER TABLE products ADD COLUMN updated_at TEXT"),e.exec("UPDATE products SET updated_at = created_at WHERE updated_at IS NULL")),u.__aircomfortDb=e}return u.__aircomfortDb}let l=e=>1===e||!0===e;function N(e){let t;if(e.specs)try{t=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:t,in_stock:l(e.in_stock),is_hit:l(e.is_hit),is_promo:l(e.is_promo)}}let d=e=>({...e,is_visible:l(e.is_visible)}),_=e=>({...e,is_visible:l(e.is_visible)}),U=e=>({...e,is_active:l(e.is_active)}),O=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function A(e){let t={};for(let r of O){if(!(r in e))continue;let n=e[r];"features"===r?t[r]=JSON.stringify(n??[]):"specs"===r?t[r]=n?JSON.stringify(n):null:"boolean"==typeof n?t[r]=n?1:0:t[r]=n??null}return t}async function R(e={}){let t=e.inStockOnly?"WHERE in_stock = 1":"",r="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return p().prepare(`SELECT * FROM products ${t} ${r}`).all().map(N)}async function m(e){let t=p().prepare("SELECT * FROM products WHERE id = ?").get(e);return t?N(t):null}async function f(e){let t=A(e),r=(0,o.randomUUID)();t.updated_at=new Date().toISOString();let n=Object.keys(t);return p().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(r,...n.map(e=>t[e])),await m(r)}async function D(e,t){let r=A(t);Object.keys(r).length&&(r.updated_at=new Date().toISOString());let n=Object.keys(r);return n.length&&p().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>r[e]),e),m(e)}async function v(e){p().prepare("DELETE FROM products WHERE id = ?").run(e)}async function S(){let e={};for(let t of p().prepare("SELECT key, value FROM settings").all())e[t.key]=t.value;return e}async function F(){return p().prepare("SELECT key, value FROM settings").all()}async function y(e){let t=p().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:r,value:n}of e)t.run(r,String(n??""))}async function I(){return p().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function h(){return p().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(_)}async function g(e,t){p().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,t)}async function X(e,t){void 0!==t.sort_order&&p().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(t.sort_order,e),void 0!==t.is_visible&&p().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(t.is_visible?1:0,e)}async function C(e){p().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function M(e={}){let t=e.visibleOnly?"WHERE is_visible = 1":"",r=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return p().prepare(`SELECT * FROM reviews ${t} ORDER BY created_at DESC ${r}`).all().map(d)}async function b(e){p().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function k(e,t){let r=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===t[e])continue;r.push(`${e} = ?`);let i=t[e];n.push("boolean"==typeof i?i?1:0:i)}r.length&&p().prepare(`UPDATE reviews SET ${r.join(", ")} WHERE id = ?`).run(...n,e)}async function x(e){p().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function w(){return p().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Y(e){p().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function P(e,t){p().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(t,e)}async function H(e){p().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function G(){return p().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(U)}async function $(e){let t=p().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return t?U(t):null}async function W(e){p().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,o.randomUUID)(),String(e.slug??""),(0,o.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function j(e,t){let r=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in t))continue;r.push(`${e} = ?`);let i=t[e];n.push("boolean"==typeof i?i?1:0:i)}r.length&&p().prepare(`UPDATE employees_cards SET ${r.join(", ")} WHERE id = ?`).run(...n,e)}async function B(e){p().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function V(e){let t=p().prepare("SELECT value FROM auth WHERE key = ?").get(e);return t?t.value:null}function q(e,t){p().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,t)}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[8948],()=>r(49134));module.exports=n})();