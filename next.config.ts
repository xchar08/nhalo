// ============================================================================
// FILE: next.config.ts
// ============================================================================
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode enables double-invocation of effects in dev to catch bugs early,
  // crucial for complex graph state logic.
  reactStrictMode: true,

  // Image optimization configuration.
  // Allowing external domains commonly used for research/profile images if needed later.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Next.js 15 experimental flags or specific rewrites can go here.
  // Currently keeping standard configuration for Vercel deployment compatibility.
  experimental: {
    // optimizedPackageImports helps with heavy libraries like visualizers
    optimizePackageImports: ["@supabase/supabase-js", "lucide-react"],
  },
};

export default nextConfig;
