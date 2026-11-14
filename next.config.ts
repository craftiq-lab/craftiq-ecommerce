import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel বা লোকাল বিল্ডের সময় TypeScript এরর ইগনোর করার জন্য
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;