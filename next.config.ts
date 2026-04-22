import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['@prisma/client'],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false, // Forcefully purge compilation dev indicator (N logo)
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge'
    ]
  },
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'https://infraconnectai.up.railway.app/socket.io/:path*'
      }
    ];
  }
};

export default nextConfig;
