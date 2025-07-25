import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["avatars.githubusercontent.com","res.cloudinary.com","i.imgur.com"],
  },
};

export default nextConfig;