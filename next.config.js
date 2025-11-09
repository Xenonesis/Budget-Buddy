/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', 'puppeteer'],
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: '192.168.180.1' }
    ],
  },
  reactStrictMode: true,
  turbopack: {},
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
}

module.exports = nextConfig