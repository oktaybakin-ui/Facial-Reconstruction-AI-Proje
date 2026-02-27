import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clcztcmxkmhrtnajciqd.supabase.co',
        port: '',
        pathname: '/storage/v1/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/**',
      },
    ],
  },
};

export default nextConfig;
