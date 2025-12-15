/**
 * Serverless Functions Entry Point
 * This file serves as the main entry point for standalone serverless functions
 * that can be deployed to Vercel or other serverless platforms
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Budget Buddy Serverless API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      transactions: '/api/transactions',
      budgets: '/api/budgets',
      analytics: '/api/analytics',
      ai: '/api/ai',
    },
    timestamp: new Date().toISOString(),
  });
}
