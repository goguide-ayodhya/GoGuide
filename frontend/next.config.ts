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
};

export default nextConfig;

module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
};
