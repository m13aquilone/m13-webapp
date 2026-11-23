
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a static website for Cloudflare Pages
  output: "export",

  // Required because Cloudflare Pages static hosting
  // does not provide Next.js image optimization.
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },

  // Cache Components and Partial Prefetching
  // are disabled for static export compatibility.
  cacheComponents: false,
  partialPrefetching: false,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
