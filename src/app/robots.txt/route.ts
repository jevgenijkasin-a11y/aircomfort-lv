// robots.txt from one list of AI crawlers (lib/aiFeeds), so the rules never drift apart.
export const dynamic = 'force-static';

import { robotsTxt, TEXT_HEADERS } from '@/lib/aiFeeds';

export function GET() {
  return new Response(robotsTxt(), { headers: TEXT_HEADERS });
}
