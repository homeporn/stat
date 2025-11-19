import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Turbopack is enabled by default in Next.js 16
  turbopack: {
    resolveAlias: {
      '.prisma/client/default': './node_modules/.prisma/client/client.ts',
    },
  },
};

export default nextConfig;
