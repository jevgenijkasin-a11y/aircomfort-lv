"use strict";(()=>{var e={};e.id=3440,e.ids=[3440],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},67783:e=>{e.exports=import("sharp")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},77962:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>A,requestAsyncStorage:()=>_,routeModule:()=>N,serverHooks:()=>f,staticGenerationAsyncStorage:()=>U});var n={};r.r(n),r.d(n,{POST:()=>d,dynamic:()=>L});var i=r(49303),a=r(88716),s=r(60670),o=r(87070),T=r(57147),E=r(71017),u=r.n(E),p=r(53930),c=r(75748),l=r(99272);let L="force-dynamic";async function d(e){if(!await (0,p.Jg)(e))return o.NextResponse.json({error:"Unauthorized"},{status:401});let t=(await e.formData()).get("file");if(!t)return o.NextResponse.json({error:"No file provided"},{status:400});let r=await t.arrayBuffer(),n=(t.name.split(".").pop()||"jpg").toLowerCase(),i=/^[a-z0-9]{1,5}$/.test(n)?n:"jpg",{data:a,ext:s}=await (0,l.g)(Buffer.from(r),i,1920),E=`${Date.now()}.${s}`,L=u().join(c.MF,"products");return await T.promises.mkdir(L,{recursive:!0}),await T.promises.writeFile(u().join(L,E),a),o.NextResponse.json({url:`/uploads/products/${E}`})}let N=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/admin/upload/route",pathname:"/api/admin/upload",filename:"route",bundlePath:"app/api/admin/upload/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\api\\admin\\upload\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:_,staticGenerationAsyncStorage:U,serverHooks:f}=N,m="/api/admin/upload/route";function A(){return(0,s.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:U})}},53930:(e,t,r)=>{r.d(t,{Cp:()=>l,Jg:()=>u,VP:()=>a,kS:()=>c,x4:()=>p});var n=r(6113),i=r(75748);let a="admin_token";function s(e){let t=(0,n.randomBytes)(16).toString("hex"),r=(0,n.scryptSync)(e,t,64).toString("hex");return`scrypt$${t}$${r}`}function o(e,t){let[r,i,a]=t.split("$");if("scrypt"!==r||!i||!a)return!1;let s=(0,n.scryptSync)(e,i,64),o=Buffer.from(a,"hex");return s.length===o.length&&(0,n.timingSafeEqual)(s,o)}function T(){let e=(0,i.Y6)("password_hash");if(e)return e;if(process.env.ADMIN_PASSWORD){let e=s(process.env.ADMIN_PASSWORD);return(0,i.vb)("password_hash",e),e}return null}function E(e){return(0,n.createHmac)("sha256",function(){if(process.env.ADMIN_SECRET)return process.env.ADMIN_SECRET;let e=(0,i.Y6)("session_secret");return e||(e=(0,n.randomBytes)(32).toString("hex"),(0,i.vb)("session_secret",e)),e}()).update(e).digest("hex")}async function u(e){let t=e.cookies.get(a)?.value;if(!t||t.length<10)return!1;let r=T();return!!r&&t===E(r)}async function p(e){let t=T();return t&&e&&o(e,t)?E(t):null}async function c(){}async function l(e,t){let r=T();return!!(r&&o(e,r))&&((0,i.vb)("password_hash",s(t)),!0)}},75748:(e,t,r)=>{r.d(t,{G$:()=>y,GK:()=>H,GL:()=>h,Gw:()=>v,Ir:()=>S,LH:()=>B,MF:()=>u,OV:()=>W,RN:()=>I,Rf:()=>M,Vr:()=>b,Wv:()=>g,XU:()=>w,Y6:()=>q,c0:()=>X,db:()=>l,f1:()=>G,f5:()=>$,fd:()=>k,g8:()=>x,i0:()=>C,jd:()=>F,my:()=>Y,nM:()=>D,rE:()=>P,ry:()=>R,sJ:()=>j,tr:()=>A,vb:()=>V,wv:()=>O});var n=r(55467),i=r(71017),a=r.n(i),s=r(57147),o=r.n(s),T=r(6113);let E=process.env.DATA_DIR||a().join(process.cwd(),"data"),u=a().join(E,"uploads"),p=`
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
`,c=globalThis;function l(){if(!c.__aircomfortDb){o().mkdirSync(E,{recursive:!0});let e=new n.DatabaseSync(a().join(E,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(p),e.prepare("PRAGMA table_info(products)").all().map(e=>e.name).includes("updated_at")||(e.exec("ALTER TABLE products ADD COLUMN updated_at TEXT"),e.exec("UPDATE products SET updated_at = created_at WHERE updated_at IS NULL")),c.__aircomfortDb=e}return c.__aircomfortDb}let L=e=>1===e||!0===e;function d(e){let t;if(e.specs)try{t=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:t,in_stock:L(e.in_stock),is_hit:L(e.is_hit),is_promo:L(e.is_promo)}}let N=e=>({...e,is_visible:L(e.is_visible)}),_=e=>({...e,is_visible:L(e.is_visible)}),U=e=>({...e,is_active:L(e.is_active)}),f=["name_lv","name_ru","name_en","brand","price","install_price","power_kw","area_coverage","energy_class","features","image_url","category","brand_color","in_stock","is_hit","is_promo","discount_percent","description_lv","description_ru","description_en","specs"];function m(e){let t={};for(let r of f){if(!(r in e))continue;let n=e[r];"features"===r?t[r]=JSON.stringify(n??[]):"specs"===r?t[r]=n?JSON.stringify(n):null:"boolean"==typeof n?t[r]=n?1:0:t[r]=n??null}return t}async function A(e={}){let t=e.inStockOnly?"WHERE in_stock = 1":"",r="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return l().prepare(`SELECT * FROM products ${t} ${r}`).all().map(d)}async function O(e){let t=l().prepare("SELECT * FROM products WHERE id = ?").get(e);return t?d(t):null}async function R(e){let t=m(e),r=(0,T.randomUUID)();t.updated_at=new Date().toISOString();let n=Object.keys(t);return l().prepare(`INSERT INTO products (id${n.map(e=>`, ${e}`).join("")}) VALUES (?${", ?".repeat(n.length)})`).run(r,...n.map(e=>t[e])),await O(r)}async function D(e,t){let r=m(t);Object.keys(r).length&&(r.updated_at=new Date().toISOString());let n=Object.keys(r);return n.length&&l().prepare(`UPDATE products SET ${n.map(e=>`${e} = ?`).join(", ")} WHERE id = ?`).run(...n.map(e=>r[e]),e),O(e)}async function S(e){l().prepare("DELETE FROM products WHERE id = ?").run(e)}async function v(){let e={};for(let t of l().prepare("SELECT key, value FROM settings").all())e[t.key]=t.value;return e}async function y(){return l().prepare("SELECT key, value FROM settings").all()}async function g(e){let t=l().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");for(let{key:r,value:n}of e)t.run(r,String(n??""))}async function h(){return l().prepare("SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC").all().map(e=>e.image_url)}async function F(){return l().prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC").all().map(_)}async function I(e,t){l().prepare("INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)").run(e,t)}async function X(e,t){void 0!==t.sort_order&&l().prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?").run(t.sort_order,e),void 0!==t.is_visible&&l().prepare("UPDATE hero_slides SET is_visible = ? WHERE id = ?").run(t.is_visible?1:0,e)}async function b(e){l().prepare("DELETE FROM hero_slides WHERE id = ?").run(e)}async function M(e={}){let t=e.visibleOnly?"WHERE is_visible = 1":"",r=e.limit?`LIMIT ${Math.floor(e.limit)}`:"";return l().prepare(`SELECT * FROM reviews ${t} ORDER BY created_at DESC ${r}`).all().map(N)}async function w(e){l().prepare("INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)").run(e.author_name,e.text_lv??"",e.text_ru??"",e.text_en??"",e.rating??5,e.is_visible?1:0)}async function x(e,t){let r=[],n=[];for(let e of["author_name","text_lv","text_ru","text_en","rating","is_visible"]){if(void 0===t[e])continue;r.push(`${e} = ?`);let i=t[e];n.push("boolean"==typeof i?i?1:0:i)}r.length&&l().prepare(`UPDATE reviews SET ${r.join(", ")} WHERE id = ?`).run(...n,e)}async function C(e){l().prepare("DELETE FROM reviews WHERE id = ?").run(e)}async function k(){return l().prepare("SELECT * FROM contacts ORDER BY created_at DESC").all()}async function P(e){l().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')").run(e.name,e.phone,e.email??"",e.service??"",e.message??"")}async function Y(e,t){l().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(t,e)}async function H(e){l().prepare("DELETE FROM contacts WHERE id = ?").run(e)}async function j(){return l().prepare("SELECT * FROM employees_cards ORDER BY created_at ASC").all().map(U)}async function $(e){let t=l().prepare("SELECT * FROM employees_cards WHERE token = ? AND is_active = 1").get(e);return t?U(t):null}async function B(e){l().prepare("INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run((0,T.randomUUID)(),String(e.slug??""),(0,T.randomUUID)().replace(/-/g,""),String(e.name??""),String(e.title??""),String(e.phone??""),String(e.email??""),e.photo_url||null,Number(e.photo_position??50),!1===e.is_active?0:1)}async function W(e,t){let r=[],n=[];for(let e of["slug","name","title","phone","email","photo_url","photo_position","is_active"]){if(!(e in t))continue;r.push(`${e} = ?`);let i=t[e];n.push("boolean"==typeof i?i?1:0:i)}r.length&&l().prepare(`UPDATE employees_cards SET ${r.join(", ")} WHERE id = ?`).run(...n,e)}async function G(e){l().prepare("DELETE FROM employees_cards WHERE id = ?").run(e)}function q(e){let t=l().prepare("SELECT value FROM auth WHERE key = ?").get(e);return t?t.value:null}function V(e,t){l().prepare("INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(e,t)}},99272:(e,t,r)=>{r.d(t,{g:()=>n});async function n(e,t,n=1920){if("svg"===t||"gif"===t)return{data:e,ext:t,optimized:!1};try{let t=(await Promise.resolve().then(r.bind(r,67783))).default;return{data:await t(e).rotate().resize({width:n,withoutEnlargement:!0}).webp({quality:82}).toBuffer(),ext:"webp",optimized:!0}}catch(r){return console.warn("[upload] image not optimized (sharp unavailable or unreadable file):",r?.message),{data:e,ext:t,optimized:!1}}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[8948,5972],()=>r(77962));module.exports=n})();