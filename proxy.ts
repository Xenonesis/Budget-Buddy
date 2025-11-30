import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for Edge Runtime
// For production at scale, use a distributed store like Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or forwarded header
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
  return `rate-limit:${ip}`;
}

function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitKey = getRateLimitKey(request);

    // Different limits for different endpoints
    let limit = 100;
    let windowMs = 60000;

    if (pathname.startsWith('/api/ai/')) {
      limit = 20; // More restrictive for AI endpoints
    } else if (pathname.startsWith('/api/auth/')) {
      limit = 10; // Very restrictive for auth endpoints
      windowMs = 60000;
    }

    const { allowed, remaining, resetTime } = checkRateLimit(rateLimitKey, limit, windowMs);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetTime),
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(resetTime));

    return response;
  }

  // Block any requests to external image services that might cause 404s
  if (pathname.startsWith('/_next/image')) {
    const url = request.nextUrl.searchParams.get('url');

    // Allow local images
    if (url && (url.startsWith('/') || url.includes('localhost') || url.includes('127.0.0.1'))) {
      return NextResponse.next();
    }

    // Block problematic external image URLs
    if (url) {
      try {
        const parsedUrl = new URL(url);
        // Block known problematic hosts
        if (
          parsedUrl.hostname === 'images.unsplash.com' ||
          parsedUrl.pathname.includes('photo-1494790108755-2616b612b786')
        ) {
          const transparentPixel =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          return NextResponse.redirect(transparentPixel);
        }
      } catch {
        // If URL is invalid, block it
        const transparentPixel =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        return NextResponse.redirect(transparentPixel);
      }
    }
  }

  // Security: Prevent clickjacking for specific routes
  if (pathname.startsWith('/auth/') || pathname.startsWith('/dashboard/')) {
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Image optimization
    '/_next/image/:path*',
    // Protected routes
    '/auth/:path*',
    '/dashboard/:path*',
  ],
};
