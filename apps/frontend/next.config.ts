import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests in development
  allowedDevOrigins: ["172.20.10.2", "localhost", "127.0.0.1"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.stripe.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 300, // Increased cache time to 5 minutes
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable optimization for external images to avoid timeout
    unoptimized: true,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

// Přidáno: CSP hlavičky pro externí služby (Packeta, Stripe, Google apod.)
export const headers = async () => [
  {
    source: "/(.*)",
    headers: [
      {
        key: "Content-Security-Policy",
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://widget.packeta.com https://www.googletagmanager.com https://www.google-analytics.com;
          style-src 'self' 'unsafe-inline' https://widget.packeta.com;
          img-src * blob: data:;
          connect-src 'self' http://localhost:3000 http://localhost:9292 https://widget.packeta.com https://www.googleapis.com https://jnn-pa.googleapis.com https://api.segment.io https://*.ingest.sentry.io;
          frame-src https://widget.packeta.com;
        `
          .replace(/\s{2,}/g, " ")
          .trim(),
      },
    ],
  },
];

export default nextConfig;
