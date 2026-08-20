/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // @sparticuz/chromium ships a native binary that webpack relocates,
      // breaking the path lookup. Externalizing keeps it in node_modules.
      const existing = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...existing, '@sparticuz/chromium'];
    }
    return config;
  },
};

module.exports = nextConfig;
