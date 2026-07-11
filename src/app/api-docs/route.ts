// Human/agent-readable API documentation (service-doc target of the
// /.well-known/api-catalog linkset).
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? 'aircomfort.lv';
  const base = `${proto}://${host}`;

  const md = `# AirComfort.lv API Documentation

Public API of [aircomfort.lv](${base}) — air conditioning sales and
installation in Latvia (Riga). OpenAPI spec: [${base}/openapi.json](${base}/openapi.json)

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

- API catalog (RFC 9727): [${base}/.well-known/api-catalog](${base}/.well-known/api-catalog)
- LLM guidance: [${base}/llms.txt](${base}/llms.txt)
`;

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
