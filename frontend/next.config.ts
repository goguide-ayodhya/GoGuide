import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // domains: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
