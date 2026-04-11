import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
};

// Only wrap with next-pwa in production to avoid Turbopack/webpack conflict
if (process.env.NODE_ENV === "production") {
  const withPWAInit = require("next-pwa");
  const withPWA = withPWAInit({ dest: "public" });
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
