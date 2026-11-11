const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const normalize = (str) => (str ? str.replace(/\\system32\\/gi, '\\System32\\') : str);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  images: {
    // Originals (uploads up to ~3500 px, several MB) never reach the client:
    // next/image serves resized AVIF/WebP variants, cached in .next/cache/images.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Hero slides stored in the DB may still point to Unsplash
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Build time = deploy date (the built .next is committed and deployed):
  // lastmod of the static pages in the sitemap.
  env: { BUILD_TIME: new Date().toISOString() },

  // Hides the "X-Powered-By: Next.js" header
  poweredByHeader: false,

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/lv',
        permanent: true, // 308, like the other addresses without a language
      },
      // The new admin moved from /admin-v2 to /admin
      { source: '/admin-v2', destination: '/admin', permanent: true },
      // The old admin panel was removed
      { source: '/admin-old', destination: '/admin', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby", </.well-known/ai-plugin.json>; rel="ai-catalog"',
          },
          {
            key: 'Content-Signal',
            value: 'search=yes, ai-input=yes, ai-train=no',
          },
          // Security headers (checked by Mozilla Observatory / securityheaders.com)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          {
            key: 'Content-Security-Policy',
            // Inline scripts/styles are needed by Next.js itself (theme script, hydration data, JSON-LD);
            // everything else may come from this origin only. Images: own uploads, data URIs, and the
            // https hosts allowed in images.remotePatterns.
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              // Google Maps embed on the contacts page
              "frame-src 'self' https://www.google.com https://maps.google.com",
              "object-src 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    // Fix: Windows System32 path casing inconsistency causes webpack to load
    // the same module twice. Normalize all path fields that form module identifiers.
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap('WindowsPathNormalizer', (nmf) => {
          nmf.hooks.beforeResolve.tap('WindowsPathNormalizer', (resolveData) => {
            if (!resolveData) return;
            resolveData.request = normalize(resolveData.request);
            resolveData.context = normalize(resolveData.context);
          });

          nmf.hooks.afterResolve.tap('WindowsPathNormalizer', (resolveData) => {
            if (!resolveData) return;
            resolveData.resource = normalize(resolveData.resource);
            if (resolveData.createData) {
              resolveData.createData.resource = normalize(resolveData.createData.resource);
              resolveData.createData.userRequest = normalize(resolveData.createData.userRequest);
              resolveData.createData.request = normalize(resolveData.createData.request);
            }
          });
        });
      },
    });

    return config;
  },
};

module.exports = withNextIntl(nextConfig);