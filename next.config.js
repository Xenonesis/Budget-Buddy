/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    // Enable SVG support for our generated avatars
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.netlify.app; connect-src 'self' https://vercel.live https://*.netlify.app;",
    // Optimize image handling - enable optimization for production
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Conditional optimization based on environment
    unoptimized: process.env.NODE_ENV === 'development' || process.env.NETLIFY === 'true',
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Domains for external images (if needed)
    domains: [],
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.netlify.app',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  // Enable strict mode for production, disable for development
  reactStrictMode: process.env.NODE_ENV === 'production',
  // Output configuration for different platforms
  output: process.env.NETLIFY === 'true' ? 'export' : undefined,
  trailingSlash: process.env.NETLIFY === 'true',
  // Asset prefix handling
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : undefined,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig