import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
