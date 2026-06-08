/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix: "Persisting failed: Another write batch or compaction is already active"
  // This is a LevelDB race condition with the Webpack persistent filesystem cache.
  // Switching to memory cache eliminates the error entirely.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
