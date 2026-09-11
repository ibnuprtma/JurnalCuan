import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel memiliki pipeline serverless sendiri, jangan gunakan 'standalone' di Vercel
  // agar tidak memicu error ENOENT next-server.js.nft.json.
  // 'standalone' tetap aktif otomatis untuk build Docker / Self-hosted.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
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
