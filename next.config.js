/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@supabase/supabase-js', 'puppeteer'],
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
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    domains: ['localhost', '127.0.0.1', '192.168.180.1'],
  },
  reactStrictMode: true,
  experimental: {
    // Enable React 19 compatibility
  },
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
        tls: false,
        net: false,
      };
    }
    
    // Handle canvas for server-side rendering
    if (isServer) {
      config.externals.push('canvas');
    }
    
    // Exclude puppeteer from client-side bundles
    if (!isServer) {
      config.externals.push('puppeteer');
    }
    
    // Add resolve alias for React 19 compatibility
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': 'react',
      'react-dom': 'react-dom',
    };
    
    return config;
  },
}

module.exports = nextConfig