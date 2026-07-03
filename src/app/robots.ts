import type { MetadataRoute } from 'next';

const AI_CRAWLERS = [
  'GPTBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Google-Extended', 'Amazonbot',
  'YouBot', 'CCBot', 'cohere-ai', 'Applebot-Extended',
  'DuckAssistBot', 'Bytespider', 'Meta-ExternalAgent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      ...AI_CRAWLERS.map((bot) => ({ userAgent: bot, allow: '/' as const })),
    ],
    sitemap: 'https://aircomfort.lv/sitemap.xml',
    host: 'https://aircomfort.lv',
  };
}
