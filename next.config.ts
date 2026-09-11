import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output 'standalone' hanya diaktifkan saat build Docker (BUILD_STANDALONE=1).
  // Pada environment lokal (npm run start) dan Vercel, menggunakan output standar
  // agar 'next start' dan deployment Vercel berjalan normal tanpa error.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" } : {}),
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
