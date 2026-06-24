/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/sql-practice",
        destination: "/sql-practice.html",
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["mammoth", "pdf-parse", "resend", "@sparticuz/chromium", "puppeteer-core"],
    outputFileTracingIncludes: {
      "/api/test-rewrite": ["./node_modules/@sparticuz/chromium/**/*"],
    },
  },
};
module.exports = nextConfig;
