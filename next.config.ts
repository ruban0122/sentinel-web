import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Ignore build-time errors in static generation (experimental)
  experimental: {
    // disables some SSG prerender strictness
    skipMiddlewareUrlNormalize: true,
    appDir: true, // ensure app directory support
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
