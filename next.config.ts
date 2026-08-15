import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
       {
        protocol: "https",
        hostname: "images.universe.com",
      },
    ],
  },
};

export default nextConfig;