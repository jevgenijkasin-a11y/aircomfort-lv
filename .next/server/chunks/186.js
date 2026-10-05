exports.id=186,exports.ids=[186],exports.modules={77039:(t,e,a)=>{var n={"./en.json":[54175,4175],"./lv.json":[35646,5646],"./ru.json":[26313,6313]};function i(t){if(!a.o(n,t))return Promise.resolve().then(()=>{var e=Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e});var e=n[t],i=e[0];return a.e(e[1]).then(()=>a.t(i,19))}i.keys=()=>Object.keys(n),i.id=77039,t.exports=i},49303:(t,e,a)=>{"use strict";t.exports=a(30517)},45257:(t,e,a)=>{"use strict";a.d(e,{Cp:()=>w,US:()=>B,_M:()=>f,a:()=>p,ng:()=>E,t5:()=>u});var n=a(75748),i=a(67820),r=a(25866),o=a(35168),l=a(9551),s=a(44486),c=a(58053);let u={"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"},p={"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, max-age=3600"},m=["/admin","/api/","/card/"],d=["GPTBot","ClaudeBot","Claude-Web","Claude-User","Claude-SearchBot","anthropic-ai","ChatGPT-User","OAI-SearchBot","PerplexityBot","Perplexity-User","Google-Extended","Amazonbot","YouBot","CCBot","cohere-ai","Applebot-Extended","DuckAssistBot","Bytespider","Meta-ExternalAgent"];function f(){let t=t=>[`User-agent: ${t}`,"Allow: /",...m.map(t=>`Disallow: ${t}`)].join("\n");return[t("*"),"# AI crawlers - allowed for search and ai-input, not for training",...d.map(t),"Content-Signal: search=yes, ai-input=yes, ai-train=no",`Sitemap: ${o._n}/sitemap.xml
Host: ${o._n}`].join("\n\n")+"\n"}let g=async t=>(await a(77039)(`./${t}.json`)).default,h=(t,e="")=>`${o._n}/${t}${e}`,$={lv:"Latviešu",ru:"Русский",en:"English"};async function v(){let t=(0,n.kb)(),e=(0,i.EQ)(t),a=(0,r.DX)((0,r.IL)(await (0,n.tr)({inStockOnly:!0,orderBy:"price"}),e)),o=t=>a.filter(e=>e.category===t.key),c=Object.fromEntries(await Promise.all(s.A5.map(async t=>[t,await g(t)]))),u=(t,e)=>(t.is_system&&l.Kf[t.key]?c[e].categories[l.Kf[t.key]]:"")||(0,i.m)(t,e),p=t=>t.is_system?`/catalog/type/${t.slug}`:`/catalog/category/${t.slug}`,m=t=>({cat:t,name:e=>u(t,e),path:p(t),products:o(t)});return{tree:(0,i.CL)(t).filter(({cat:t})=>!e.has(t.key)).map(({cat:t,children:a})=>({...m(t),children:a.filter(t=>!e.has(t.key)).map(m).filter(t=>t.products.length)})).filter(t=>t.products.length||t.children.length),brands:Array.from(new Set(a.map(t=>t.brand))).sort((t,e)=>t.localeCompare(e)),msgs:c,count:a.length}}let y=()=>Object.fromEntries(s.A5.map(t=>[t,(0,c.YB)(t)])),k=(t,e)=>t[`meta_description_${e}`]?.trim()||(0,s.X1)(t[`body_${e}`],160),b=(t,e)=>h(e,`/blog/${t.slug}`),_=t=>`# AirComfort.lv — llms.txt
# Structured site description for AI crawlers and language models.
# https://llmstxt.org

---

## Latviešu

# AirComfort.lv

> Klimatiekārtu piegāde, uzstādīšana un apkope Latvijā

AirComfort.lv ir Latvijas uzņēmums, kas nodarbojas ar gaisa kondicionieru un siltumsūkņu pārdošanu, profesionālu uzstādīšanu un apkopi privātpersonām un uzņēmumiem visā Latvijā.

### Pakalpojumi

- **Pārdošana** — plašs kondicionēšanas iekārtu klāsts no vadošajiem ražotājiem
- **Uzstādīšana** — profesionāla montāža no 1 dienas, 3 gadu garantija
- **Apkope** — regulārs serviss, tīrīšana un remonts, ātra reaģēšana
- **Konsultācija** — bezmaksas konsultācija un optimālā risinājuma izvēle

### Zīmoli

${t}

### Kontakti

- Vietne: https://aircomfort.lv/lv
- E-pasts: info@aircomfort.lv
- Tālrunis: +371 28828400
- Atrašanās vieta: Rīga, Latvija
- Darba laiks: Pirmdiena–Piektdiena 9:00–18:00

### Valodu versijas

- **Latviešu** (galvenā): https://aircomfort.lv/lv
- Krievu: https://aircomfort.lv/ru
- Angļu: https://aircomfort.lv/en

---

## Русский

# AirComfort.lv

> Продажа, монтаж и обслуживание кондиционеров и тепловых насосов в Латвии

AirComfort.lv — латвийская компания: продажа, профессиональный монтаж и обслуживание кондиционеров и тепловых насосов для частных клиентов и компаний по всей Латвии.

### Услуги

- **Продажа** — широкий выбор климатической техники ведущих производителей
- **Монтаж** — профессиональная установка от 1 дня, гарантия 3 года
- **Обслуживание** — регулярный сервис, чистка и ремонт, быстрый выезд
- **Консультация** — бесплатная консультация и подбор оптимального решения

### Бренды

${t}

### Контакты

- Сайт: https://aircomfort.lv/ru
- E-mail: info@aircomfort.lv
- Телефон: +371 28828400
- Местоположение: Рига, Латвия
- Время работы: понедельник–пятница 9:00–18:00

---

## English

# AirComfort.lv

> Air conditioner supply, installation and maintenance in Latvia

AirComfort.lv is a Latvian company specialising in the sale, professional installation and maintenance of air conditioning systems and heat pumps for residential and commercial customers throughout Latvia.

### Services

- **Supply**: Wide range of air conditioning equipment from leading brands
- **Installation**: Professional installation with a 3-year warranty, all work completed in one day
- **Maintenance**: Regular servicing, cleaning and repairs, fast response
- **Consultation**: Free consultation and selection of the optimal solution for your space

### Brands

${t}

### Contact

- Website: https://aircomfort.lv/en
- Email: info@aircomfort.lv
- Phone: +371 28828400
- Location: Riga, Latvia
- Working hours: Mon–Fri 9:00–18:00

### Language Versions

- **Latvian** (primary): https://aircomfort.lv/lv
- Russian: https://aircomfort.lv/ru
- English: https://aircomfort.lv/en
`,j=(t,e)=>s.A5.map(a=>`[${t(a)}](${h(a,e)})`).join(" \xb7 ");async function w(){let{tree:t,brands:e,msgs:a,count:n}=await v(),i=y();return[_(e.join(", ")).trimEnd(),function(t,e){let a=[`## Katalogs / Каталог / Catalog`,"",`${e} products in stock. Links: Latvian \xb7 Russian \xb7 English.`,""];for(let e of t){let t=e.products.length+e.children.reduce((t,e)=>t+e.products.length,0);for(let n of(a.push(`- ${j(e.name,e.path)} — ${t}`),e.children))a.push(`  - ${j(n.name,n.path)} — ${n.products.length}`)}return a.join("\n")}(t,n),function(t){let e=s.A5.flatMap(e=>t[e].filter(t=>"subsidy"===t.category).map(t=>`- [${t[`title_${e}`]}](${b(t,e)}): ${k(t,e)}`));return e.length?["## Valsts atbalsts siltumsūkņiem (EKII) / Господдержка на тепловые насосы (EKII) / State subsidy for heat pumps (EKII)","","Latvian state support programme (EKII) for heat pumps; current conditions are in the article.","",...e].join("\n"):""}(i),function(t){let e=s.A5.filter(e=>t[e].length).map(e=>[`### ${$[e]}`,"",...t[e].map(t=>`- [${t[`title_${e}`]}](${b(t,e)}): ${k(t,e)}`)].join("\n"));return e.length?["## Padomi / Полезное / Guides",...e].join("\n\n"):""}(i),["## Feeds / Plūsmas / Ленты","",...s.A5.filter(t=>i[t].length).map(t=>`- [RSS — ${a[t].blog.metaTitle} (${t})](${h(t,"/blog/rss.xml")})`),`- [Sitemap](${o._n}/sitemap.xml)`,`- [llms-full.txt](${o._n}/llms-full.txt): full catalog of products in stock (prices, power, area, energy class, SEER/SCOP, noise) and article summaries`].join("\n")].filter(Boolean).join("\n\n---\n\n")+"\n"}let C=t=>`${String(Math.round(t)).replace(/\B(?=(\d{3})+(?!\d))/g," ")} €`,A=(t,e)=>String(t.specs?.[e]??"").trim();function x(t){let e=(0,l.iq)(t),a=(0,l.ny)(t,"en"),n=(0,l.MY)(t),i=A(t,"seer"),r=A(t,"scop"),o=A(t,"noise_db"),s=[`brand ${t.brand}`,e?`price ${C(e)}${t.discount_percent?` (−${t.discount_percent}%, was ${C(t.price)})`:""}`:"price on request",t.power_kw>0?`${t.power_kw} kW`:"",a?`area ${a} m\xb2`:n?`${n} rooms`:"",t.energy_class?`energy class ${t.energy_class}`:"",[i&&`SEER ${i}`,r&&`SCOP ${r}`].filter(Boolean).join(" / "),o?`noise ${o} dB(A)`:""].filter(Boolean),c=e=>h(e,`/catalog/${t.id}`);return`- ${(0,l.g9)(t,"lv")} — ${s.join(", ")} — ${c("lv")} (ru: ${c("ru")}, en: ${c("en")})`}async function E(){let{tree:t}=await v(),e=y();return[(await w()).trimEnd(),function(t){let e=["## Products in stock / Preces / Товары","","Prices in EUR for the equipment; installation is quoted separately. Links: Latvian page first, Russian and English versions in brackets."];for(let a of t)for(let t of(e.push("",`### ${a.name("lv")} / ${a.name("ru")} / ${a.name("en")}`,`${h("lv",a.path)}`),a.products.length&&e.push("",...a.products.map(x)),a.children))e.push("",`#### ${t.name("lv")} / ${t.name("ru")} / ${t.name("en")}`,`${h("lv",t.path)}`,"",...t.products.map(x));return e.join("\n")}(t),function(t){let e=s.A5.filter(e=>t[e].length).map(e=>[`### ${$[e]}`,...t[e].map(t=>[`#### ${t[`title_${e}`]}`,...(0,s.jj)(t[`body_${e}`],3),`Full article: ${b(t,e)}`].join("\n\n"))].join("\n\n"));return e.length?["## Article summaries / Rakstu kopsavilkumi / Кратко о статьях",...e].join("\n\n"):""}(e)].filter(Boolean).join("\n\n---\n\n")+"\n"}let S=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),L=t=>new Date(t.includes("T")||t.endsWith("Z")?t:`${t.replace(" ","T")}Z`).toUTCString();async function B(t){let{blog:e}=await g(t),a=(0,c.YB)(t),n=a.map(e=>{let a=b(e,t);return`<item><title>${S(e[`title_${t}`])}</title><link>${a}</link><description>${S(k(e,t))}</description><pubDate>${L((0,c.iM)(e))}</pubDate><guid isPermaLink="true">${a}</guid></item>`}),i=a.map(t=>t.updated_at).sort().at(-1);return`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${S(`${e.metaTitle} | AirComfort`)}</title>
<link>${h(t,"/blog")}</link>
<description>${S(e.metaDescription)}</description>
<language>${t}</language>
<atom:link href="${h(t,"/blog/rss.xml")}" rel="self" type="application/rss+xml"/>
${i?`<lastBuildDate>${L(i)}</lastBuildDate>
`:""}${n.join("\n")}
</channel>
</rss>
`}},58053:(t,e,a)=>{"use strict";a.d(e,{$E:()=>m,IF:()=>g,YB:()=>u,dt:()=>c,eP:()=>p,iM:()=>h,wS:()=>f});var n=a(75748),i=a(44486),r=a(25866),o=a(9551),l=a(67820),s=a(35168);let c=t=>"ru"===t||"en"===t?t:"lv",u=t=>(0,n.DJ)({publishedOnly:!0}).filter(e=>(0,i.t5)(e,c(t)));function p(t,e){let a=(0,n.vX)(t);return a&&a.is_published&&(0,i.t5)(a,c(e))?a:null}async function m(t,e=4){let a=(0,r.IL)(await (0,n.tr)({inStockOnly:!0,orderBy:"price"}),(0,n.OM)());if(t.related_product_ids.length){let e=new Map(a.map(t=>[t.id,t])),n=t.related_product_ids.map(t=>e.get(t)).filter(t=>!!t);if(n.length)return n}if(!t.related_catalog)return[];let i=t=>t.is_hit?0:t.is_promo?1:2;return(function(t,e){let[,,a,i]=e.split("/");if(!a)return t;if("brand"===a)return t.filter(t=>(0,o.eP)(t.brand)===i);let r=(0,n.kb)(),s="type"===a?(0,o.SE)(i):"category"===a?r.find(t=>t.slug===i)?.key:null;if(!s)return[];let c=(0,l.bX)(r,s);return t.filter(t=>c.has(t.category))})(a,t.related_catalog).map((t,e)=>({p:t,i:e})).sort((t,e)=>i(t.p)-i(e.p)||t.i-e.i).slice(0,e).map(t=>t.p)}let d={home:{cooling:2},heat_pump:{heating:2,cooling:1},commercial:{cooling:2},commercial_heat_pump:{heating:2,subsidy:1},fan_coils:{heating:2}};function f(t,e,a=2){let i=u(e),r=t.category.startsWith("fan_coils")?"fan_coils":t.category,l=o.j4[t.category],s=new Set([...l?[`/catalog/type/${l}`]:[],..."fan_coils"===r?(0,n.kb)().filter(t=>t.key.startsWith("fan_coils")).map(t=>`/catalog/category/${t.slug}`):[]]),c=t=>(s.has(t.related_catalog)?3:0)+(d[r]?.[t.category]??0);return i.map((t,e)=>({a:t,s:c(t),i:e})).sort((t,e)=>e.s-t.s||t.i-e.i).slice(0,a).map(t=>t.a)}function g(t,e){let a=(0,i.h6)(t),n=e=>`${s._n}/${e}/blog/${t.slug}`,r={};for(let t of a)r[t]=n(t);return r["x-default"]=n(a.includes("lv")?"lv":a[0]),{canonical:n(e),languages:r}}let h=t=>t.published_at??t.created_at},25866:(t,e,a)=>{"use strict";a.d(e,{Cz:()=>n,DX:()=>o,IL:()=>r,pP:()=>i});let n=24,i={"1719d7c0-0070-473d-907f-7e7d542eafba":"76662679-b614-4719-a279-49bb3f67acc8"},r=(t,e=new Set)=>t.filter(t=>!i[t.id]&&!e.has(t.category)),o=t=>[...t].sort((t,e)=>(t.price>0?0:1)-(e.price>0?0:1))}};