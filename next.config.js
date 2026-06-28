const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const normalize = (str) => (str ? str.replace(/\\system32\\/gi, '\\System32\\') : str);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/lv',
        permanent: false,
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