/**
 * Serverless Function Helpers
 * Utilities for building serverless functions with consistent patterns
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerClient } from '@supabase/ssr';

// Types
export interface ServerlessConfig {
  cors?: boolean;
  auth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string;
    email?: string;
  };
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
 * Apply CORS headers to response
 */
export function applyCors(res: VercelResponse): void {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsPreFlight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    applyCors(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Validate HTTP method
 */
export function validateMethod(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    res.status(405).json({
      error: 'Method Not Allowed',
      allowed: allowedMethods,
    });
    return false;
  }
  return true;
}

/**
 * Parse JSON body safely
 */
export async function parseBody<T = any>(req: VercelRequest): Promise<T | null> {
  try {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    return req.body as T;
  } catch (error) {
    return null;
  }
}

/**
 * Get Supabase client for serverless function
 */
export function getSupabaseClient(req: VercelRequest) {
  const cookies = parseCookies(req.headers.cookie || '');

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies[name];
        },
        set(name: string, value: string, options: any) {
          // Not needed for serverless
        },
        remove(name: string, options: any) {
          // Not needed for serverless
        },
      },
    }
  );
}

/**
 * Parse cookies from cookie header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

/**
 * Authenticate request using Supabase
 */
export async function authenticateRequest(
  req: AuthenticatedRequest,
  res: VercelResponse
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient(req);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    return true;
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
    return false;
  }
}

/**
 * Error response helper
 */
export function errorResponse(
  res: VercelResponse,
  message: string,
  status: number = 500,
  details?: any
) {
  return res.status(status).json({
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Success response helper
 */
export function successResponse(res: VercelResponse, data: any, status: number = 200) {
  return res.status(status).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create a serverless function wrapper with common middleware
 */
export function createServerlessHandler(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>,
  config: ServerlessConfig = {}
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      // Handle CORS
      if (config.cors !== false) {
        if (handleCorsPreFlight(req, res)) {
          return;
        }
        applyCors(res);
      }

      // Handle authentication
      if (config.auth) {
        const isAuthenticated = await authenticateRequest(req, res);
        if (!isAuthenticated) {
          return;
        }
      }

      // Execute handler
      await handler(req, res);
    } catch (error) {
      console.error('Serverless function error:', error);
      errorResponse(res, 'Internal Server Error', 500, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
 * Get client IP address
 */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}
