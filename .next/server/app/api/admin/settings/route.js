"use strict";(()=>{var e={};e.id=80,e.ids=[80],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},38161:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>U,patchFetch:()=>A,requestAsyncStorage:()=>N,routeModule:()=>L,serverHooks:()=>d,staticGenerationAsyncStorage:()=>_});var n={};r.r(n),r.d(n,{GET:()=>l,PUT:()=>p,dynamic:()=>u});var i=r(49303),s=r(88716),a=r(60670),T=r(87070),o=r(53930),E=r(75748);let u="force-dynamic";function c(){return T.NextResponse.json({error:"Unauthorized"},{status:401})}async function l(e){return await (0,o.Jg)(e)?T.NextResponse.json(await (0,E.G$)()):c()}async function p(e){if(!await (0,o.Jg)(e))return c();let t=await e.json();return Array.isArray(t)?(await (0,E.Wv)(t),T.NextResponse.json({success:!0})):T.NextResponse.json({error:"Expected an array"},{status:400})}let L=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/admin/settings/route",pathname:"/api/admin/settings",filename:"route",bundlePath:"app/api/admin/settings/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\api\\admin\\settings\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:N,staticGenerationAsyncStorage:_,serverHooks:d}=L,U="/api/admin/settings/route";function A(){return(0,a.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:_})}},53930:(e,t,r)=>{r.d(t,{Cp:()=>p,Jg:()=>u,VP:()=>s,kS:()=>l,x4:()=>c});var n=r(6113),i=r(75748);let s="admin_token";function a(e){let t=(0,n.randomBytes)(16).toString("hex"),r=(0,n.scryptSync)(e,t,64).toString("hex");return`scrypt$${t}$${r}`}function T(e,t){let[r,i,s]=t.split("$");if("scrypt"!==r||!i||!s)return!1;let a=(0,n.scryptSync)(e,i,64),T=Buffer.from(s,"hex");return a.length===T.length&&(0,n.timingSafeEqual)(a,T)}function o(){let e=(0,i.Y6)("password_hash");if(e)return e;if(process.env.ADMIN_PASSWORD){let e=a(process.env.ADMIN_PASSWORD);return(0,i.vb)("password_hash",e),e}return null}function E(e){return(0,n.createHmac)("sha256",function(){if(process.env.ADMIN_SECRET)return process.env.ADMIN_SECRET;let e=(0,i.Y6)("session_secret");return e||(e=(0,n.randomBytes)(32).toString("hex"),(0,i.vb)("session_secret",e)),e}()).update(e).digest("hex")}async function u(e){let t=e.cookies.get(s)?.value;if(!t||t.length<10)return!1;let r=o();return!!r&&t===E(r)}async function c(e){let t=o();return t&&e&&T(e,t)?E(t):null}async function l(){}async function p(e,t){let r=o();return!!(r&&T(e,r))&&((0,i.vb)("password_hash",a(t)),!0)}},75748:(e,t,r)=>{r.d(t,{G$:()=>S,GK:()=>H,GL:()=>g,Gw:()=>y,Ir:()=>v,LH:()=>$,MF:()=>u,OV:()=>G,RN:()=>I,Rf:()=>x,Vr:()=>M,Wv:()=>F,XU:()=>b,Y6:()=>q,c0:()=>X,db:()=>p,f1:()=>B,f5:()=>j,fd:()=>k,g8:()=>C,i0:()=>w,jd:()=>h,my:()=>P,nM:()=>D,rE:()=>Y,ry:()=>m,sJ:()=>W,tr:()=>O,vb:()=>V,wv:()=>f});var n=r(55467),i=r(71017),s=r.n(i),a=r(57147),T=r.n(a),o=r(6113);let E=process.env.DATA_DIR||s().join(process.cwd(),"data"),u=s().join(E,"uploads"),c=`
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
`,l=globalThis;function p(){if(!l.__aircomfortDb){T().mkdirSync(E,{recursive:!0});let e=new n.DatabaseSync(s().join(E,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(c),l.__aircomfortDb=e}return l.__aircomfortDb}let L=e=>1===e||!0===e;function N(e){let t;if(e.specs)try{t=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:t,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let _=e=>({...e,is_visible:L(e.is_visible)}),d=e=>({...e,is_visible:L(e.is_visible)}),U=e=>({...e,is_active:L(e.is_active)}),A=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function R(e){let t={};for(let r of A){if(!(r in e))continue;let n=e[r];"features"===r?t[r]=JSON.stringify(n??[]):"specs"===r?t[r]=n?JSON.stringify(n):null:"boolean"==typeof n?t[r]=n?1:0:t[r]=n??null}return t}async function O(e={}){let t=e.inStockOnly?"WHERE in_stock = 1":"",r="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return p().prepare(`SELECT * FROM products ${t} ${r}`).all().map(N)}async function f(e){let t=p().prepare("SELECT * FROM products WHERE id = ?").get(e);return t?N(t):null}async function m(e){let t=R(e),r=(0,o.randomUUID)(),n=Object.keys(t);return p().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(r,...n.map(e=>t[e])),await f(r)}async function D(e,t){let r=R(t),n=Object.keys(r);return n.length&&p().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>r[e]),e),f(e)}async function v(e){p().prepare("DELETE FROM products WHERE id = ?").run(e)}async function y(){let e={};for(let t of p().prepare("SELECT key, value FROM settings").all())e[t.key]=t.value;return e}async function S(){return p().prepare("SELECT key, value FROM settings").all()}async function F(e){let t=p().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:r,value:n}of e)t.run(r,String(n??""))}async function g(){return p().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function h(){return p().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(d)}async function I(e,t){p().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,t)}async function X(e,t){void 0!==t.sort_order&&p().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(t.sort_order,e),void 0!==t.is_visible&&p().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(t.is_visible?1:0,e)}async function M(e){p().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function x(e={}){let t=e.visibleOnly?"WHERE is_visible = 1":"",r=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return p().prepare(`SELECT * FROM reviews ${t} ORDER BY created_at DESC ${r}`).all().map(_)}async function b(e){p().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function C(e,t){let r=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===t[e])continue;r.push(`${e} = ?`);let i=t[e];n.push("boolean"==typeof i?i?1:0:i)}r.length&&p().prepare(`UPDATE reviews SET ${r.join(", ")} WHERE id = ?`).run(...n,e)}async function w(e){p().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function k(){return p().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Y(e){p().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function P(e,t){p().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(t,e)}async function H(e){p().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function W(){return p().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(U)}async function j(e){let t=p().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return t?U(t):null}async function $(e){p().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,o.randomUUID)(),String(e.slug??""),(0,o.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function G(e,t){let r=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in t))continue;r.push(`${e} = ?`);let i=t[e];n.push("boolean"==typeof i?i?1:0:i)}r.length&&p().prepare(`UPDATE employees_cards SET ${r.join(", ")} WHERE id = ?`).run(...n,e)}async function B(e){p().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function q(e){let t=p().prepare("SELECT value FROM auth WHERE key = ?").get(e);return t?t.value:null}function V(e,t){p().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,t)}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[948,59],()=>r(38161));module.exports=n})();