/**
 * Demo Serverless Endpoint with Enhanced Utilities
 * Demonstrates the new serverless helper functions
 */

import { NextRequest } from 'next/server';
import {
  createNextHandler,
  successResponse,
  errorResponse,
  parseBody,
  getSupabaseClient,
  applyRateLimit,
  getClientIp,
} from '../../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  // Apply rate limiting
  const rateLimitError = applyRateLimit(request, 10, 60000);
  if (rateLimitError) {
    return rateLimitError;
  }

  const method = request.method;
  const clientIp = getClientIp(request);

  // GET: Return demo information
  if (method === 'GET') {
    const { searchParams } = new URL(request.url);
    const echo = searchParams.get('echo');

    return successResponse({
      message: 'Serverless helpers are working!',
      features: [
        '✅ Authentication middleware',
        '✅ CORS handling',
        '✅ Rate limiting',
        '✅ Error handling',
        '✅ Type-safe responses',
        '✅ Supabase integration',
      ],
      request: {
        method,
        clientIp,
        timestamp: new Date().toISOString(),
      },
      ...(echo && { echo }),
    });
  }

  // POST: Echo back the request body
  if (method === 'POST') {
    const body = await parseBody(request);

    if (!body) {
      return errorResponse('Invalid JSON body', 400);
    }

    return successResponse(
      {
        message: 'Request received successfully',
        received: body,
        clientIp,
        timestamp: new Date().toISOString(),
      },
      201
    );
  }

  return errorResponse('Method not allowed', 405);
}

export const GET = createNextHandler(handler, {
  auth: false,
  cors: true,
  methods: ['GET', 'POST'],
});

export const POST = createNextHandler(handler, {
  auth: false,
  cors: true,
  methods: ['GET', 'POST'],
});
