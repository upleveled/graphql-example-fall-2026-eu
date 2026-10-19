import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  images: {
    // Disable image optimization on Fly.io to avoid crashes from 256MB memory limit
    unoptimized: !process.env.VERCEL,
  },
  typescript: {
    // Ignore TypeScript errors because types already checked during CI
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
