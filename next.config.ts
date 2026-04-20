import type { NextConfig } from "next";

/** Dev-only: where the real API listens (no trailing slash). Server-side hop — not subject to browser CORS. */
const apiProxyTarget = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV !== "development" || !apiProxyTarget) {
      return [];
    }
    return [
      {
        source: "/_imotrak_proxy/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
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