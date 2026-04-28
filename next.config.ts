import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "cloudinary-images",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /\/api\/venues.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "venues-api",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  // Moved from experimental.serverComponentsExternalPackages (Next.js 15+)
  serverExternalPackages: ["pg"],

  // Silence Turbopack warning from next-pwa's webpack config
  turbopack: {},

  // Allow mobile devices on the same LAN to access the dev server
  allowedDevOrigins: ["192.168.1.10", "192.168.1.102"],

  images: {
    // Allow optimized images from these remote hosts
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Disable optimization for local /uploads/* paths
    // This lets us serve files saved to public/uploads without restriction
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = withPWA(nextConfig);
