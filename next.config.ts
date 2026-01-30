import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  
  // Compression
  compress: true,
};

export default nextConfig;
