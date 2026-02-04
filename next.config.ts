import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
    // @ts-expect-error turbopack types might be missing in this version
    turbopack: {
      root: __dirname,
    },
  },
};

export default nextConfig;
