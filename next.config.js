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

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/lv',
        permanent: false,
      },
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