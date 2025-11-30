/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  // External packages that should be bundled server-side
  serverExternalPackages: ['@supabase/supabase-js', 'puppeteer'],
  
  // Image optimization settings
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Development-only patterns
      ...(isDev ? [
        { protocol: 'http', hostname: 'localhost' },
        { protocol: 'http', hostname: '127.0.0.1' },
      ] : []),
    ],
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Note: Turbopack is used automatically in dev mode with Next.js 16
  // For production builds, webpack is used as Turbopack production builds
  // are still experimental with Tailwind CSS 4
  
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Strict mode for builds
  typescript: {
    // Type checking is done separately in CI
    ignoreBuildErrors: false,
  },
  
  // Experimental features for performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'recharts',
      'framer-motion',
    ],
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: isDev,
    },
  },
  
  // Security headers
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // Script sources - minimize unsafe-inline/eval in production
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://cdnjs.cloudflare.com https://unpkg.com https://vercel.live`.trim(),
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
      // Connect sources for API calls
      [
        "connect-src 'self'",
        'data:',
        'https://unpkg.com',
        'https://tessdata.projectnaptha.com',
        'https://*.supabase.co',
        'https://cdnjs.cloudflare.com',
        // AI providers
        'https://api.mistral.ai',
        'https://api.anthropic.com',
        'https://api.groq.com',
        'https://api.deepseek.com',
        'https://api.cohere.ai',
        'https://generativelanguage.googleapis.com',
        'https://api.openai.com',
        'https://openrouter.ai',
        'https://api.cerebras.ai',
        'https://api.x.ai',
        'https://vercel.live',
        // Local AI in development
        ...(isDev ? ['http://localhost:11434', 'http://localhost:1234'] : []),
      ].join(' '),
      "worker-src 'self' blob:",
      "frame-src 'self' https://vercel.live",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ];

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
          },
          // HSTS - only in production
          ...(!isDev ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : []),
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/:path*.@(jpg|jpeg|gif|png|svg|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts
      {
        source: '/:path*.@(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes should not be cached
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Redirects for common patterns
  async redirects() {
    return [
      // Redirect common typos or old URLs
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;