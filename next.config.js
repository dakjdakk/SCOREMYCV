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
      "/api/rewrite-cv": ["./node_modules/@sparticuz/chromium/**/*"],
      "/api/ats-score": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
      "/api/rewrite-cv": ["./node_modules/@sparticuz/chromium/**/*", "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    },
  },
};
module.exports = nextConfig;
