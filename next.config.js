/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      }
    ],
    domains: ['localhost', '127.0.0.1', '192.168.180.1'],
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that don't work in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
      };
    }
    
    // Handle canvas for server-side rendering
    if (isServer) {
      config.externals.push('canvas');
    }
    
    return config;
  },
}

module.exports = nextConfig