/**
 * Next.js App Router Adapter for Serverless Helpers
 * Adapts Vercel serverless helpers to work with Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Types
export interface AuthenticatedNextRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
  };
}

export interface NextJSHandlerConfig {
  cors?: boolean;
  auth?: boolean;
  methods?: string[];
}

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

/**
 * Apply CORS headers to NextResponse
 */
export function applyCors(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return applyCors(response);
  }
  return null;
}

/**
 * Validate HTTP method
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        error: 'Method Not Allowed',
        allowed: allowedMethods,
      },
      { status: 405 }
    );
  }
  return null;
}

/**
 * Parse JSON body safely from NextRequest
 */
export async function parseBody<T = any>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

/**
 * Get Supabase client for Next.js App Router
 */
export async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignore errors in middleware
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // Ignore errors in middleware
          }
        },
      },
    }
  );
}

/**
 * Authenticate request using Supabase
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: any; error?: string }> {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: 'Unauthorized' };
    }

    return { user };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Error response helper for Next.js
 */
export function errorResponse(message: string, status: number = 500, details?: any): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Success response helper for Next.js
 */
export function successResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
  return response;
}

/**
 * Create a Next.js App Router handler with common middleware
 */
export function createNextHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: NextJSHandlerConfig = {}
) {
  return async (request: NextRequest) => {
    try {
      // Handle CORS preflight
      if (config.cors !== false) {
        const corsResponse = handleCorsPreFlight(request);
        if (corsResponse) {
          return corsResponse;
        }
      }

      // Validate methods if specified
      if (config.methods && config.methods.length > 0) {
        const methodError = validateMethod(request, config.methods);
        if (methodError) {
          return config.cors !== false ? applyCors(methodError) : methodError;
        }
      }

      // Handle authentication
      if (config.auth) {
        const { user, error } = await authenticateRequest(request);
        if (error || !user) {
          const response = errorResponse('Unauthorized', 401);
          return config.cors !== false ? applyCors(response) : response;
        }
        // Attach user to request (for TypeScript, we'd need to extend NextRequest)
        (request as any).user = user;
      }

      // Execute handler
      const response = await handler(request);

      // Apply CORS to response
      return config.cors !== false ? applyCors(response) : response;
    } catch (error) {
      console.error('Next.js handler error:', error);
      const response = errorResponse('Internal Server Error', 500, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return config.cors !== false ? applyCors(response) : response;
    }
  };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get client IP address from Next.js request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * Apply rate limiting to request
 */
export function applyRateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp, maxRequests, windowMs)) {
    return errorResponse('Too Many Requests', 429, {
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
  return null;
}
