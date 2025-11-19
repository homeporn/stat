import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow importing .ts files from .prisma/client
      config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
        '.jsx': ['.tsx', '.jsx'],
      };
    }
    return config;
  },
};

export default nextConfig;
