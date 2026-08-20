/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevents Next.js from bundling these packages — keeps them as external
    // node_modules so @sparticuz/chromium's native binary path stays valid.
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
};

module.exports = nextConfig;
