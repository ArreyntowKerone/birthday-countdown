import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Provide an empty turbopack config to avoid Turbopack/webpack detection errors
  turbopack: {},
};

export default pwaConfig(nextConfig);
