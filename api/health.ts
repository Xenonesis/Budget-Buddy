/**
 * Serverless Function: Health Check
 * Simple health check endpoint for monitoring
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerlessHandler, successResponse } from './_lib/serverless-helpers';

async function handler(req: VercelRequest, res: VercelResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  return successResponse(res, health);
}

export default createServerlessHandler(handler, {
  auth: false,
  cors: true,
});
