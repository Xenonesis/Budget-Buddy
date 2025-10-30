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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://unpkg.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' data: https://unpkg.com https://tessdata.projectnaptha.com https://*.supabase.co https://cdnjs.cloudflare.com https://api.mistral.ai https://api.anthropic.com https://api.groq.com https://api.deepseek.com https://api.cohere.ai https://generativelanguage.googleapis.com https://api.openai.com https://openrouter.ai https://api.cerebras.ai https://api.x.ai https://vercel.live",
              "worker-src 'self' blob:",
              "frame-src 'self' https://vercel.live",
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          },
          {
            key: 'Permissions-Policy',
            value: 'interest-cohort=()'
          }
        ],
      },
    ]
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