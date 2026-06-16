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
  serverExternalPackages: ["mammoth", "pdf-parse"],
};
module.exports = nextConfig;
