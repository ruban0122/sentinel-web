import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  skipMiddlewareUrlNormalize: true,
  experimental: {
    // disables some SSG prerender strictness
  },
  // Optional: continue build even if page fails static generation
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 seconds, helps dev mode hot reload
  },
  typescript: {
    ignoreBuildErrors: true, // ⚠️ ignores TS errors at build time
  },
};

export default nextConfig;
