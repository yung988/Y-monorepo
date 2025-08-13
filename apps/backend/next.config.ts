import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimentální funkce pro rychlejší navigaci
  // experimental: {
  //   // Aggressive prefetching (optimizePackageImports je podporováno v Next.js 15)
  //   optimizePackageImports: ['lucide-react'],
  // },
  // Compiler optimalizace
  // Webpack optimalizace
  // Optimalizace obrázků
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "6gtahwcca6a0qxzw.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Security headers
  // Produkční optimalizace
};

export default nextConfig;
