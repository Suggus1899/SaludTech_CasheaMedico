/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@saludtech/ui", "@saludtech/shared"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
