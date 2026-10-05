// llms-full.txt: llms.txt + every product in stock (visible categories only) and article summaries.
export const dynamic = 'force-dynamic';

import { llmsFullTxt, TEXT_HEADERS } from '@/lib/aiFeeds';

export async function GET() {
  return new Response(await llmsFullTxt(), { headers: TEXT_HEADERS });
}
