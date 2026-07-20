"use strict";(()=>{var e={};e.id=130,e.ids=[130],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},14456:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>U,patchFetch:()=>R,requestAsyncStorage:()=>N,routeModule:()=>L,serverHooks:()=>d,staticGenerationAsyncStorage:()=>_});var n={};t.r(n),t.d(n,{GET:()=>l,POST:()=>p,dynamic:()=>u});var i=t(49303),s=t(88716),a=t(60670),T=t(87070),o=t(53930),E=t(75748);let u="force-dynamic";function c(){return T.NextResponse.json({error:"Unauthorized"},{status:401})}async function l(e){return await (0,o.Jg)(e)?T.NextResponse.json(await (0,E.jd)()):c()}async function p(e){if(!await (0,o.Jg)(e))return c();let{image_url:r}=await e.json();if(!r)return T.NextResponse.json({error:"image_url required"},{status:400});let t=await (0,E.jd)(),n=t.length>0?Math.max(...t.map(e=>e.sort_order)):-1;return await (0,E.RN)(r,n+1),T.NextResponse.json({success:!0})}let L=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/admin/slides/route",pathname:"/api/admin/slides",filename:"route",bundlePath:"app/api/admin/slides/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\api\\admin\\slides\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:N,staticGenerationAsyncStorage:_,serverHooks:d}=L,U="/api/admin/slides/route";function R(){return(0,a.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:_})}},53930:(e,r,t)=>{t.d(r,{Cp:()=>p,Jg:()=>u,VP:()=>s,kS:()=>l,x4:()=>c});var n=t(6113),i=t(75748);let s="admin_token";function a(e){let r=(0,n.randomBytes)(16).toString("hex"),t=(0,n.scryptSync)(e,r,64).toString("hex");return`scrypt$${r}$${t}`}function T(e,r){let[t,i,s]=r.split("$");if("scrypt"!==t||!i||!s)return!1;let a=(0,n.scryptSync)(e,i,64),T=Buffer.from(s,"hex");return a.length===T.length&&(0,n.timingSafeEqual)(a,T)}function o(){let e=(0,i.Y6)("password_hash");if(e)return e;if(process.env.ADMIN_PASSWORD){let e=a(process.env.ADMIN_PASSWORD);return(0,i.vb)("password_hash",e),e}return null}function E(e){return(0,n.createHmac)("sha256",function(){if(process.env.ADMIN_SECRET)return process.env.ADMIN_SECRET;let e=(0,i.Y6)("session_secret");return e||(e=(0,n.randomBytes)(32).toString("hex"),(0,i.vb)("session_secret",e)),e}()).update(e).digest("hex")}async function u(e){let r=e.cookies.get(s)?.value;if(!r||r.length<10)return!1;let t=o();return!!t&&r===E(t)}async function c(e){let r=o();return r&&e&&T(e,r)?E(r):null}async function l(){}async function p(e,r){let t=o();return!!(t&&T(e,t))&&((0,i.vb)("password_hash",a(r)),!0)}},75748:(e,r,t)=>{t.d(r,{G$:()=>y,GK:()=>H,GL:()=>h,Gw:()=>S,Ir:()=>v,LH:()=>$,MF:()=>u,OV:()=>G,RN:()=>I,Rf:()=>x,Vr:()=>M,Wv:()=>F,XU:()=>b,Y6:()=>q,c0:()=>X,db:()=>p,f1:()=>B,f5:()=>W,fd:()=>k,g8:()=>C,i0:()=>w,jd:()=>g,my:()=>P,nM:()=>D,rE:()=>Y,ry:()=>m,sJ:()=>j,tr:()=>A,vb:()=>V,wv:()=>f});var n=t(55467),i=t(71017),s=t.n(i),a=t(57147),T=t.n(a),o=t(6113);let E=process.env.DATA_DIR||s().join(process.cwd(),"data"),u=s().join(E,"uploads"),c=`
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
`,l=globalThis;function p(){if(!l.__aircomfortDb){T().mkdirSync(E,{recursive:!0});let e=new n.DatabaseSync(s().join(E,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(c),l.__aircomfortDb=e}return l.__aircomfortDb}let L=e=>1===e||!0===e;function N(e){let r;if(e.specs)try{r=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:r,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let _=e=>({...e,is_visible:L(e.is_visible)}),d=e=>({...e,is_visible:L(e.is_visible)}),U=e=>({...e,is_active:L(e.is_active)}),R=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function O(e){let r={};for(let t of R){if(!(t in e))continue;let n=e[t];"features"===t?r[t]=JSON.stringify(n??[]):"specs"===t?r[t]=n?JSON.stringify(n):null:"boolean"==typeof n?r[t]=n?1:0:r[t]=n??null}return r}async function A(e={}){let r=e.inStockOnly?"WHERE in_stock = 1":"",t="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return p().prepare(`SELECT * FROM products ${r} ${t}`).all().map(N)}async function f(e){let r=p().prepare("SELECT * FROM products WHERE id = ?").get(e);return r?N(r):null}async function m(e){let r=O(e),t=(0,o.randomUUID)(),n=Object.keys(r);return p().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(t,...n.map(e=>r[e])),await f(t)}async function D(e,r){let t=O(r),n=Object.keys(t);return n.length&&p().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>t[e]),e),f(e)}async function v(e){p().prepare("DELETE FROM products WHERE id = ?").run(e)}async function S(){let e={};for(let r of p().prepare("SELECT key, value FROM settings").all())e[r.key]=r.value;return e}async function y(){return p().prepare("SELECT key, value FROM settings").all()}async function F(e){let r=p().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:t,value:n}of e)r.run(t,String(n??""))}async function h(){return p().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function g(){return p().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(d)}async function I(e,r){p().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,r)}async function X(e,r){void 0!==r.sort_order&&p().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(r.sort_order,e),void 0!==r.is_visible&&p().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(r.is_visible?1:0,e)}async function M(e){p().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function x(e={}){let r=e.visibleOnly?"WHERE is_visible = 1":"",t=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return p().prepare(`SELECT * FROM reviews ${r} ORDER BY created_at DESC ${t}`).all().map(_)}async function b(e){p().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function C(e,r){let t=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===r[e])continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&p().prepare(`UPDATE reviews SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function w(e){p().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function k(){return p().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Y(e){p().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function P(e,r){p().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(r,e)}async function H(e){p().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function j(){return p().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(U)}async function W(e){let r=p().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return r?U(r):null}async function $(e){p().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,o.randomUUID)(),String(e.slug??""),(0,o.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function G(e,r){let t=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in r))continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&p().prepare(`UPDATE employees_cards SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function B(e){p().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function q(e){let r=p().prepare("SELECT value FROM auth WHERE key = ?").get(e);return r?r.value:null}function V(e,r){p().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,r)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[948,59],()=>t(14456));module.exports=n})();