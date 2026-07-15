const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@saludtech/ui", "@saludtech/i18n"],
};

module.exports = withNextIntl(nextConfig);
