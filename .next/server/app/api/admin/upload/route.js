"use strict";(()=>{var e={};e.id=440,e.ids=[440],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},77962:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>f,patchFetch:()=>O,requestAsyncStorage:()=>d,routeModule:()=>N,serverHooks:()=>U,staticGenerationAsyncStorage:()=>_});var n={};t.r(n),t.d(n,{POST:()=>L,dynamic:()=>l});var i=t(49303),s=t(88716),a=t(60670),o=t(87070),T=t(57147),E=t(71017),u=t.n(E),c=t(53930),p=t(75748);let l="force-dynamic";async function L(e){if(!await (0,c.Jg)(e))return o.NextResponse.json({error:"Unauthorized"},{status:401});let r=(await e.formData()).get("file");if(!r)return o.NextResponse.json({error:"No file provided"},{status:400});let t=await r.arrayBuffer(),n=(r.name.split(".").pop()||"jpg").toLowerCase(),i=/^[a-z0-9]{1,5}$/.test(n)?n:"jpg",s=`${Date.now()}.${i}`,a=u().join(p.MF,"products");return await T.promises.mkdir(a,{recursive:!0}),await T.promises.writeFile(u().join(a,s),Buffer.from(t)),o.NextResponse.json({url:`/uploads/products/${s}`})}let N=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/admin/upload/route",pathname:"/api/admin/upload",filename:"route",bundlePath:"app/api/admin/upload/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\api\\admin\\upload\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:d,staticGenerationAsyncStorage:_,serverHooks:U}=N,f="/api/admin/upload/route";function O(){return(0,a.patchFetch)({serverHooks:U,staticGenerationAsyncStorage:_})}},53930:(e,r,t)=>{t.d(r,{Cp:()=>l,Jg:()=>u,VP:()=>s,kS:()=>p,x4:()=>c});var n=t(6113),i=t(75748);let s="admin_token";function a(e){let r=(0,n.randomBytes)(16).toString("hex"),t=(0,n.scryptSync)(e,r,64).toString("hex");return`scrypt$${r}$${t}`}function o(e,r){let[t,i,s]=r.split("$");if("scrypt"!==t||!i||!s)return!1;let a=(0,n.scryptSync)(e,i,64),o=Buffer.from(s,"hex");return a.length===o.length&&(0,n.timingSafeEqual)(a,o)}function T(){let e=(0,i.Y6)("password_hash");if(e)return e;if(process.env.ADMIN_PASSWORD){let e=a(process.env.ADMIN_PASSWORD);return(0,i.vb)("password_hash",e),e}return null}function E(e){return(0,n.createHmac)("sha256",function(){if(process.env.ADMIN_SECRET)return process.env.ADMIN_SECRET;let e=(0,i.Y6)("session_secret");return e||(e=(0,n.randomBytes)(32).toString("hex"),(0,i.vb)("session_secret",e)),e}()).update(e).digest("hex")}async function u(e){let r=e.cookies.get(s)?.value;if(!r||r.length<10)return!1;let t=T();return!!t&&r===E(t)}async function c(e){let r=T();return r&&e&&o(e,r)?E(r):null}async function p(){}async function l(e,r){let t=T();return!!(t&&o(e,t))&&((0,i.vb)("password_hash",a(r)),!0)}},75748:(e,r,t)=>{t.d(r,{G$:()=>y,GK:()=>H,GL:()=>h,Gw:()=>S,Ir:()=>v,LH:()=>W,MF:()=>u,OV:()=>B,RN:()=>I,Rf:()=>b,Vr:()=>M,Wv:()=>F,XU:()=>C,Y6:()=>q,c0:()=>X,db:()=>l,f1:()=>G,f5:()=>j,fd:()=>k,g8:()=>x,i0:()=>w,jd:()=>g,my:()=>P,nM:()=>D,rE:()=>Y,ry:()=>m,sJ:()=>$,tr:()=>A,vb:()=>V,wv:()=>R});var n=t(55467),i=t(71017),s=t.n(i),a=t(57147),o=t.n(a),T=t(6113);let E=process.env.DATA_DIR||s().join(process.cwd(),"data"),u=s().join(E,"uploads"),c=`
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
`,p=globalThis;function l(){if(!p.__aircomfortDb){o().mkdirSync(E,{recursive:!0});let e=new n.DatabaseSync(s().join(E,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(c),p.__aircomfortDb=e}return p.__aircomfortDb}let L=e=>1===e||!0===e;function N(e){let r;if(e.specs)try{r=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:r,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let d=e=>({...e,is_visible:L(e.is_visible)}),_=e=>({...e,is_visible:L(e.is_visible)}),U=e=>({...e,is_active:L(e.is_active)}),f=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function O(e){let r={};for(let t of f){if(!(t in e))continue;let n=e[t];"features"===t?r[t]=JSON.stringify(n??[]):"specs"===t?r[t]=n?JSON.stringify(n):null:"boolean"==typeof n?r[t]=n?1:0:r[t]=n??null}return r}async function A(e={}){let r=e.inStockOnly?"WHERE in_stock = 1":"",t="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return l().prepare(`SELECT * FROM products ${r} ${t}`).all().map(N)}async function R(e){let r=l().prepare("SELECT * FROM products WHERE id = ?").get(e);return r?N(r):null}async function m(e){let r=O(e),t=(0,T.randomUUID)(),n=Object.keys(r);return l().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(t,...n.map(e=>r[e])),await R(t)}async function D(e,r){let t=O(r),n=Object.keys(t);return n.length&&l().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>t[e]),e),R(e)}async function v(e){l().prepare("DELETE FROM products WHERE id = ?").run(e)}async function S(){let e={};for(let r of l().prepare("SELECT key, value FROM settings").all())e[r.key]=r.value;return e}async function y(){return l().prepare("SELECT key, value FROM settings").all()}async function F(e){let r=l().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:t,value:n}of e)r.run(t,String(n??""))}async function h(){return l().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function g(){return l().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(_)}async function I(e,r){l().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,r)}async function X(e,r){void 0!==r.sort_order&&l().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(r.sort_order,e),void 0!==r.is_visible&&l().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(r.is_visible?1:0,e)}async function M(e){l().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function b(e={}){let r=e.visibleOnly?"WHERE is_visible = 1":"",t=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return l().prepare(`SELECT * FROM reviews ${r} ORDER BY created_at DESC ${t}`).all().map(d)}async function C(e){l().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function x(e,r){let t=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===r[e])continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&l().prepare(`UPDATE reviews SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function w(e){l().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function k(){return l().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function Y(e){l().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function P(e,r){l().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(r,e)}async function H(e){l().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function $(){return l().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(U)}async function j(e){let r=l().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return r?U(r):null}async function W(e){l().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,T.randomUUID)(),String(e.slug??""),(0,T.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function B(e,r){let t=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in r))continue;t.push(`${e} = ?`);let i=r[e];n.push("boolean"==typeof i?i?1:0:i)}t.length&&l().prepare(`UPDATE employees_cards SET ${t.join(", ")} WHERE id = ?`).run(...n,e)}async function G(e){l().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function q(e){let r=l().prepare("SELECT value FROM auth WHERE key = ?").get(e);return r?r.value:null}function V(e,r){l().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,r)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[948,59],()=>t(77962));module.exports=n})();