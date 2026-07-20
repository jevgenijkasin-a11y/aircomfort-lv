"use strict";(()=>{var e={};e.id=488,e.ids=[488],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},57578:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>U,patchFetch:()=>A,requestAsyncStorage:()=>N,routeModule:()=>L,serverHooks:()=>d,staticGenerationAsyncStorage:()=>_});var n={};t.r(n),t.d(n,{DELETE:()=>p,PUT:()=>l,dynamic:()=>u});var i=t(49303),s=t(88716),a=t(60670),T=t(87070),E=t(53930),o=t(75748);let u="force-dynamic";function c(){return T.NextResponse.json({error:"Unauthorized"},{status:401})}async function l(e,{params:r}){if(!await (0,E.Jg)(e))return c();let{id:t}=await r;return await (0,o.g8)(Number(t),await e.json()),T.NextResponse.json({success:!0})}async function p(e,{params:r}){if(!await (0,E.Jg)(e))return c();let{id:t}=await r;return await (0,o.i0)(Number(t)),T.NextResponse.json({success:!0})}let L=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/admin/reviews/[id]/route",pathname:"/api/admin/reviews/[id]",filename:"route",bundlePath:"app/api/admin/reviews/[id]/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\api\\admin\\reviews\\[id]\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:N,staticGenerationAsyncStorage:_,serverHooks:d}=L,U="/api/admin/reviews/[id]/route";function A(){return(0,a.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:_})}},53930:(e,r,t)=>{t.d(r,{Cp:()=>p,Jg:()=>u,VP:()=>s,kS:()=>l,x4:()=>c});var n=t(6113),i=t(75748);let s="admin_token";function a(e){let r=(0,n.randomBytes)(16).toString("hex"),t=(0,n.scryptSync)(e,r,64).toString("hex");return`scrypt$${r}$${t}`}function T(e,r){let[t,i,s]=r.split("$");if("scrypt"!==t||!i||!s)return!1;let a=(0,n.scryptSync)(e,i,64),T=Buffer.from(s,"hex");return a.length===T.length&&(0,n.timingSafeEqual)(a,T)}function E(){let e=(0,i.Y6)("password_hash");if(e)return e;if(process.env.ADMIN_PASSWORD){let e=a(process.env.ADMIN_PASSWORD);return(0,i.vb)("password_hash",e),e}return null}function o(e){return(0,n.createHmac)("sha256",function(){if(process.env.ADMIN_SECRET)return process.env.ADMIN_SECRET;let e=(0,i.Y6)("session_secret");return e||(e=(0,n.randomBytes)(32).toString("hex"),(0,i.vb)("session_secret",e)),e}()).update(e).digest("hex")}async function u(e){let r=e.cookies.get(s)?.value;if(!r||r.length<10)return!1;let t=E();return!!t&&r===o(t)}async function c(e){let r=E();return r&&e&&T(e,r)?o(r):null}async function l(){}async function p(e,r){let t=E();return!!(t&&T(e,t))&&((0,i.vb)("password_hash",a(r)),!0)}},75748:(e,r,t)=>{t.d(r,{G$:()=>y,GK:()=>H,GL:()=>h,Gw:()=>S,Ir:()=>D,LH:()=>$,MF:()=>u,OV:()=>B,RN:()=>I,Rf:()=>b,Vr:()=>M,Wv:()=>F,XU:()=>w,Y6:()=>q,c0:()=>X,db:()=>p,f1:()=>G,f5:()=>j,fd:()=>k,g8:()=>x,i0:()=>C,jd:()=>g,my:()=>P,nM:()=>v,rE:()=>Y,ry:()=>m,sJ:()=>W,tr:()=>R,vb:()=>V,wv:()=>f});var n=t(55467),i=t(71017),s=t.n(i),a=t(57147),T=t.n(a),E=t(6113);let o=process.env.DATA_DIR||s().join(process.cwd(),"data"),u=s().join(o,"uploads"),c=`
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
`,l=globalThis;function p(){if(!l.__aircomfortDb){T().mkdirSync(o,{recursive:!0});let e=new n.DatabaseSync(s().join(o,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(c),l.__aircomfortDb=e}return l.__aircomfortDb}let L=e=>1===e||!0===e;function N(e){let r;if(e.specs)try{r=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:r,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let _=e=>({...e,is_visible:L(e.is_visible)}),d=e=>({...e,is_visible:L(e.is_visible)}),U=e=>({...e,is_active:L(e.is_active)}),A=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function O(e){let r={};for(let t of A){if(!(t in e))continue;let n=e[t];"features"===t?r[t]=JSON.stringify(n??[]):"specs"===t?r[t]=n?JSON.stringify(n):null:"boolean"==typeof n?r[t]=n?1:0:r[t]=n??null}return r}async function R(e={}){let r=e.inStockOnly?"WHERE in_stock = 1":"",t="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return p().prepare(`SELECT * FROM products ${r} ${t}`).all().map(N)}async function f(e){let r=p().prepare("SELECT * FROM products WHERE id = ?").get(e);return r?N(r):null}async function m(e){let r=O(e),t=(0,E.randomUUID)(),n=Object.keys(r);return p().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(t,...n.map(e=>r[e])),await f(t)}async function v(e,r){let t=O(r),n=Object.keys(t);return n.length&&p().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>t[e]),e),f(e)}async function D(e){p().prepare("DELETE FROM products WHERE id = ?").run(e)}async function S(){let e={};for(let r of p().prepare("SELECT key, value FROM settings").all())e[r.key]=r.value;return e}async function y(){return p().prepare("SELECT key, value FROM settings").all()}async function F(e){let r=p().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:t,value:n}of e)r.run(t,String(n??""))}async function h(){return p().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function g(){return p().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(d)}async function I(e,r){p().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,r)}async function X(e,r){void 0!==r.sort_order&&p().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(r.sort_order,e),void 0!==r.is_visible&&p().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(r.is_visible?1:0,e)}async function M(e){p().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function b(e={}){let r=e.visibleOnly?"WHERE is_visible = 1":"",t=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return p().prepare(`SELECT * FROM reviews ${r} ORDER BY created_at DESC ${t}`).all().map(_)}async function w(e){p().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function x(e,r){let t=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===r[e])continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&p().prepare(`UPDATE reviews SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function C(e){p().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function k(){return p().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Y(e){p().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function P(e,r){p().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(r,e)}async function H(e){p().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function W(){return p().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(U)}async function j(e){let r=p().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return r?U(r):null}async function $(e){p().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,E.randomUUID)(),String(e.slug??""),(0,E.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function B(e,r){let t=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in r))continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&p().prepare(`UPDATE employees_cards SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function G(e){p().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function q(e){let r=p().prepare("SELECT value FROM auth WHERE key = ?").get(e);return r?r.value:null}function V(e,r){p().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,r)}}};var r=require("../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[948,59],()=>t(57578));module.exports=n})();