/** @type {import('next').NextConfig} */
const nextBuildId = require("next-build-id");
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  generateBuildId: () => nextBuildId({ dir: __dirname }),
};

module.exports = nextConfig;
