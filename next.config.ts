import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "i.imgur.com",
      "images.unsplash.com",
    ],
  },
   eslint: {
    // ✅ Warning: This will completely skip ESLint during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;