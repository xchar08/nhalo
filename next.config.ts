// ============================================================================
// FILE: next.config.ts
// ============================================================================
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react'],

    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '192.168.1.233:3000', // your LAN URL shown in the dev server output
      ],
    },
  },
};

export default nextConfig;
