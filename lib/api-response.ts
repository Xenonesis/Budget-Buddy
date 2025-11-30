import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a successful API response
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    status?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponse<T>> {
  const requestId = generateRequestId();
  
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  if (options?.pagination) {
    response.meta!.pagination = {
      ...options.pagination,
      totalPages: Math.ceil(options.pagination.total / options.pagination.limit),
    };
  }

  logger.debug('API success response', { requestId });

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: {
      'X-Request-Id': requestId,
      ...options?.headers,
    },
  });
}

/**
 * Create an error API response
 */
export function apiError(
  code: string,
  message: string,
  options?: {
    status?: number;
    details?: unknown;
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponse<never>> {
  const requestId = generateRequestId();
  const status = options?.status || 500;

  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(options?.details && process.env.NODE_ENV === 'development'
        ? { details: options.details }
        : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  logger.error(`API error: ${code}`, undefined, {
    requestId,
    status,
    message,
  });

  return NextResponse.json(response, {
    status,
    headers: {
      'X-Request-Id': requestId,
      ...options?.headers,
    },
  });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: (message = 'Unauthorized') =>
    apiError('UNAUTHORIZED', message, { status: 401 }),

  forbidden: (message = 'Forbidden') =>
    apiError('FORBIDDEN', message, { status: 403 }),

  notFound: (resource = 'Resource') =>
    apiError('NOT_FOUND', `${resource} not found`, { status: 404 }),

  badRequest: (message = 'Bad request', details?: unknown) =>
    apiError('BAD_REQUEST', message, { status: 400, details }),

  validationError: (details: unknown) =>
    apiError('VALIDATION_ERROR', 'Validation failed', { status: 422, details }),

  conflict: (message = 'Resource already exists') =>
    apiError('CONFLICT', message, { status: 409 }),

  rateLimited: (retryAfter?: number) =>
    apiError('RATE_LIMITED', 'Too many requests. Please try again later.', {
      status: 429,
      headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined,
    }),

  internalError: (message = 'Internal server error', details?: unknown) =>
    apiError('INTERNAL_ERROR', message, { status: 500, details }),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    apiError('SERVICE_UNAVAILABLE', message, { status: 503 }),
};

/**
 * Wrapper for async route handlers with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): () => Promise<NextResponse<ApiResponse<T> | ApiResponse<never>>> {
  return async () => {
    try {
      return await handler();
    } catch (error) {
      logger.error('Unhandled API error', error);

      if (error instanceof Error) {
        return ApiErrors.internalError(
          process.env.NODE_ENV === 'development' ? error.message : undefined,
          process.env.NODE_ENV === 'development' ? error.stack : undefined
        );
      }

      return ApiErrors.internalError();
    }
  };
}

/**
 * Parse and validate request body
 */
export async function parseBody<T>(
  request: Request,
  validate?: (data: unknown) => data is T
): Promise<{ success: true; data: T } | { success: false; error: NextResponse<ApiResponse<never>> }> {
  try {
    const body = await request.json();

    if (validate && !validate(body)) {
      return {
        success: false,
        error: ApiErrors.validationError({ message: 'Invalid request body format' }),
      };
    }

    return { success: true, data: body as T };
  } catch {
    return {
      success: false,
      error: ApiErrors.badRequest('Invalid JSON in request body'),
    };
  }
}
