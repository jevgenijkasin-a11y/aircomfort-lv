"use strict";(()=>{var e={};e.id=224,e.ids=[224],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8533:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>m,patchFetch:()=>h,requestAsyncStorage:()=>u,routeModule:()=>p,serverHooks:()=>d,staticGenerationAsyncStorage:()=>l});var n={};o.r(n),o.d(n,{GET:()=>c,dynamic:()=>i});var a=o(49303),r=o(88716),s=o(60670);let i="force-dynamic";async function c(e){let t=e.headers.get("x-forwarded-proto")??"https",o=e.headers.get("host")??"aircomfort.lv",n=`${t}://${o}`;return new Response(`# AirComfort.lv API Documentation

Public API of [aircomfort.lv](${n}) — air conditioning sales and
installation in Latvia (Riga). OpenAPI spec: [${n}/openapi.json](${n}/openapi.json)

## POST /api/contact

Submit a contact / quote request. The team replies during business hours
(Mon-Fri 9:00-18:00, Europe/Riga).

Request body (JSON):

| Field   | Type   | Required | Description                                        |
|---------|--------|----------|----------------------------------------------------|
| name    | string | yes      | Customer name                                      |
| phone   | string | yes      | Customer phone number                              |
| email   | string | no       | Email for a confirmation reply                     |
| service | string | no       | One of: install, maintenance, consultation, other  |
| message | string | no       | Free-form message                                  |

Response: \`{ "success": true }\` on success, HTTP 400 if name or phone is missing.

## GET /api/health

Health check. Returns \`{ "status": "ok" }\` (HTTP 200) when the service and
its database are available, HTTP 503 otherwise.

## Content negotiation

All site pages return Markdown when requested with \`Accept: text/markdown\`
(response \`Content-Type: text/markdown\`, token estimate in
\`x-markdown-tokens\`). HTML remains the default.

## Discovery

- API catalog (RFC 9727): [${n}/.well-known/api-catalog](${n}/.well-known/api-catalog)
- LLM guidance: [${n}/llms.txt](${n}/llms.txt)
`,{headers:{"Content-Type":"text/markdown; charset=utf-8","Cache-Control":"public, max-age=3600"}})}let p=new a.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api-docs/route",pathname:"/api-docs",filename:"route",bundlePath:"app/api-docs/route"},resolvedPagePath:"C:\\Users\\Jevgenij\\Documents\\Projects\\aircomfort-lv\\src\\app\\api-docs\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:u,staticGenerationAsyncStorage:l,serverHooks:d}=p,m="/api-docs/route";function h(){return(0,s.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:l})}},49303:(e,t,o)=>{e.exports=o(30517)}};var t=require("../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),n=t.X(0,[948],()=>o(8533));module.exports=n})();