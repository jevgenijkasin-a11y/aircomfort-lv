// llms.txt: site description, visible categories, articles and feeds (from the DB).
export const dynamic = 'force-dynamic';

import { llmsTxt, TEXT_HEADERS } from '@/lib/aiFeeds';

export async function GET() {
  return new Response(await llmsTxt(), { headers: TEXT_HEADERS });
}
