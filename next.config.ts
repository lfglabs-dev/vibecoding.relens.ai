import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  basePath: "/vibecoding",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
}

export default nextConfig
