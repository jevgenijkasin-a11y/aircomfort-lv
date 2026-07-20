"use strict";(()=>{var e={};e.id=717,e.ids=[717],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},55467:e=>{e.exports=require("node:sqlite")},71017:e=>{e.exports=require("path")},61392:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>S,requestAsyncStorage:()=>g,routeModule:()=>h,serverHooks:()=>w,staticGenerationAsyncStorage:()=>I});var T={};r.r(T),r.d(T,{default:()=>F});var a={};r.r(a),r.d(a,{GET:()=>v});var o=r(49303),n=r(88716),i=r(60670),s=r(55661),l=r(55467),E=r(71017),L=r.n(E),u=r(57147),N=r.n(u);r(6113);let c=process.env.DATA_DIR||L().join(process.cwd(),"data");L().join(c,"uploads");let p=`
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
`,U=globalThis,A=e=>1===e||!0===e;function m(e){let t;if(e.specs)try{t=JSON.parse(e.specs)}catch{}return{...e,features:JSON.parse(e.features||"[]"),specs:t,in_stock:A(e.in_stock),is_hit:A(e.is_hit),is_promo:A(e.is_promo)}}async function f(e={}){let t=e.inStockOnly?"WHERE in_stock = 1":"",r="price"===e.orderBy?"ORDER BY price ASC":"ORDER BY created_at DESC";return(function(){if(!U.__aircomfortDb){N().mkdirSync(c,{recursive:!0});let e=new l.DatabaseSync(L().join(c,"aircomfort.db"));e.exec("PRAGMA journal_mode = WAL;"),e.exec(p),U.__aircomfortDb=e}return U.__aircomfortDb})().prepare(`SELECT * FROM products ${t} ${r}`).all().map(m)}let d="https://aircomfort.lv",O=["lv","ru","en"],D=["","/catalog","/calculator","/contacts","/privacy"];async function F(){let e=await f({inStockOnly:!0});return[...D.flatMap(e=>O.map(t=>({url:`${d}/${t}${e}`,lastModified:new Date,changeFrequency:""===e?"weekly":"monthly",priority:""===e?1:.8}))),...(e??[]).flatMap(e=>O.map(t=>({url:`${d}/${t}/catalog/${e.id}`,lastModified:new Date(e.created_at),changeFrequency:"monthly",priority:.6})))]}var _=r(60707);let R={...T},y=R.default,X=R.generateSitemaps;if("function"!=typeof y)throw Error('Default export is missing in "C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\sitemap.ts"');async function v(e,t){let r;let{__metadata_id__:T,...a}=t.params||{},o=X?await X():null;if(o&&null==(r=o.find(e=>{let t=e.id.toString();return(t+=".xml")===T})?.id))return new s.NextResponse("Not Found",{status:404});let n=await y({id:r}),i=(0,_.resolveRouteData)(n,"sitemap");return new s.NextResponse(i,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=0, must-revalidate"}})}let h=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"sitemap",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"next-metadata-route-loader?page=%2Fsitemap.xml%2Froute&filePath=C%3A%5CUsers%5CJevgenij%5CDocuments%5CProjects%5Caircomfort-lv%5Csrc%5Capp%5Csitemap.ts&isDynamic=1!?__next_metadata_route__",nextConfigOutput:"",userland:a}),{requestAsyncStorage:g,staticGenerationAsyncStorage:I,serverHooks:w}=h,x="/sitemap.xml/route";function S(){return(0,i.patchFetch)({serverHooks:w,staticGenerationAsyncStorage:I})}},60707:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{resolveManifest:function(){return n},resolveRobots:function(){return a},resolveRouteData:function(){return i},resolveSitemap:function(){return o}});let T=r(91389);function a(e){let t="";for(let r of Array.isArray(e.rules)?e.rules:[e.rules]){for(let e of(0,T.resolveArray)(r.userAgent||["*"]))t+=`User-Agent: ${e}
`;if(r.allow)for(let e of(0,T.resolveArray)(r.allow))t+=`Allow: ${e}
`;if(r.disallow)for(let e of(0,T.resolveArray)(r.disallow))t+=`Disallow: ${e}
`;r.crawlDelay&&(t+=`Crawl-delay: ${r.crawlDelay}
`),t+="\n"}return e.host&&(t+=`Host: ${e.host}
`),e.sitemap&&(0,T.resolveArray)(e.sitemap).forEach(e=>{t+=`Sitemap: ${e}
`}),t}function o(e){let t=e.some(e=>Object.keys(e.alternates??{}).length>0),r="";for(let a of(r+='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',t?r+=' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n':r+=">\n",e)){var T;r+=`<url>
<loc>${a.url}</loc>
`;let e=null==(T=a.alternates)?void 0:T.languages;if(e&&Object.keys(e).length)for(let t in e)r+=`<xhtml:link rel="alternate" hreflang="${t}" href="${e[t]}" />
`;if(a.lastModified){let e=a.lastModified instanceof Date?a.lastModified.toISOString():a.lastModified;r+=`<lastmod>${e}</lastmod>
`}a.changeFrequency&&(r+=`<changefreq>${a.changeFrequency}</changefreq>
`),"number"==typeof a.priority&&(r+=`<priority>${a.priority}</priority>
`),r+="</url>\n"}return r+"</urlset>\n"}function n(e){return JSON.stringify(e)}function i(e,t){return"robots"===t?a(e):"sitemap"===t?o(e):"manifest"===t?n(e):""}},91389:(e,t)=>{function r(e){return Array.isArray(e)?e:[e]}function T(e){if(null!=e)return r(e)}Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{resolveArray:function(){return r},resolveAsArrayOrUndefined:function(){return T}})}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),T=t.X(0,[948,518],()=>r(61392));module.exports=T})();