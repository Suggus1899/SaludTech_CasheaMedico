/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@saludtech/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
