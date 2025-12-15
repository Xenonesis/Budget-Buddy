# Serverless Functions - Code Examples

This document provides practical examples for using and extending the serverless functions.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Creating Custom Functions](#creating-custom-functions)
3. [Authentication Examples](#authentication-examples)
4. [Database Operations](#database-operations)
5. [Error Handling](#error-handling)
6. [Advanced Patterns](#advanced-patterns)

## Basic Usage

### Simple GET Handler

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerlessHandler, successResponse } from './_lib/serverless-helpers';

async function handler(req: VercelRequest, res: VercelResponse) {
  const data = {
    message: 'Hello from serverless!',
    timestamp: new Date().toISOString(),
  };

  return successResponse(res, data);
}

export default createServerlessHandler(handler, {
  cors: true,
  auth: false,
});
```

### POST Handler with Body Parsing

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  parseBody,
  successResponse,
  errorResponse,
} from './_lib/serverless-helpers';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  const body = await parseBody(req);

  if (!body || !body.name) {
    return errorResponse(res, 'Missing required field: name', 400);
  }

  return successResponse(res, {
    message: `Hello, ${body.name}!`,
    received: body,
  });
}

export default createServerlessHandler(handler, { cors: true });
```

## Creating Custom Functions

### Email Notification Function

```typescript
// api/notifications/email.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  AuthenticatedRequest,
  parseBody,
  successResponse,
  errorResponse,
  getSupabaseClient,
} from '../_lib/serverless-helpers';

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
}

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  const body = await parseBody<EmailRequest>(req);

  if (!body || !body.to || !body.subject || !body.message) {
    return errorResponse(res, 'Missing required fields', 400);
  }

  // Send email logic here
  console.log('Sending email to:', body.to);

  // Store notification in database
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: req.user!.id,
      type: 'email',
      content: body.message,
      metadata: { to: body.to, subject: body.subject },
    })
    .select()
    .single();

  if (error) {
    return errorResponse(res, 'Failed to store notification', 500, error);
  }

  return successResponse(res, {
    message: 'Email sent successfully',
    notification: data,
  });
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
```

### File Upload Handler

```typescript
// api/upload.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  AuthenticatedRequest,
  successResponse,
  errorResponse,
  getSupabaseClient,
} from './_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  // Parse multipart form data (you'd need a library like busboy)
  const file = req.body; // Simplified

  if (!file) {
    return errorResponse(res, 'No file provided', 400);
  }

  const supabase = getSupabaseClient(req);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${req.user!.id}/${Date.now()}_${file.name}`, file.data, {
      contentType: file.mimetype,
    });

  if (error) {
    return errorResponse(res, 'Upload failed', 500, error);
  }

  return successResponse(res, {
    message: 'File uploaded successfully',
    path: data.path,
  });
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
```

## Authentication Examples

### Custom Authentication Middleware

```typescript
// api/_lib/custom-auth.ts
import { AuthenticatedRequest } from './serverless-helpers';
import { VercelResponse } from '@vercel/node';

export async function requireRole(
  req: AuthenticatedRequest,
  res: VercelResponse,
  requiredRole: string
): Promise<boolean> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  if (req.user.role !== requiredRole) {
    res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    return false;
  }

  return true;
}
```

Usage:

```typescript
import { requireRole } from './_lib/custom-auth';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (!(await requireRole(req, res, 'admin'))) {
    return;
  }

  // Admin-only logic here
  return successResponse(res, { message: 'Admin area' });
}
```

### API Key Authentication

```typescript
// api/_lib/api-key-auth.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './serverless-helpers';

export async function authenticateApiKey(
  req: VercelRequest,
  res: VercelResponse
): Promise<string | null> {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({ error: 'API key required' });
    return null;
  }

  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase
    .from('api_keys')
    .select('user_id')
    .eq('key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    res.status(401).json({ error: 'Invalid API key' });
    return null;
  }

  return data.user_id;
}
```

## Database Operations

### Complex Query Example

```typescript
// api/reports/monthly.ts
import { createServerlessHandler, AuthenticatedRequest } from '../_lib/serverless-helpers';
import { VercelResponse } from '@vercel/node';
import { getSupabaseClient, successResponse, errorResponse } from '../_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

  const supabase = getSupabaseClient(req);

  // Get monthly transactions
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user!.id)
    .gte('date', `${month}-01`)
    .lt('date', getNextMonth(month))
    .order('date', { ascending: false });

  if (txError) {
    return errorResponse(res, 'Failed to fetch transactions', 500, txError);
  }

  // Get monthly budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', req.user!.id)
    .eq('period', 'monthly');

  if (budgetError) {
    return errorResponse(res, 'Failed to fetch budgets', 500, budgetError);
  }

  // Calculate summary
  const summary = {
    month,
    totalIncome: transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalExpenses: transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    transactionCount: transactions.length,
    budgets: budgets.length,
  };

  return successResponse(res, {
    summary,
    transactions,
    budgets,
  });
}

function getNextMonth(month: string): string {
  const date = new Date(month + '-01');
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 7);
}

export default createServerlessHandler(handler, { auth: true });
```

### Transaction with Error Handling

```typescript
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const supabase = getSupabaseClient(req);
  const body = await parseBody(req);

  // Start transaction
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: req.user!.id,
      amount: body.amount,
      category: body.category,
      type: body.type,
    })
    .select()
    .single();

  if (txError) {
    return errorResponse(res, 'Failed to create transaction', 500, txError);
  }

  // Update budget if applicable
  if (body.type === 'expense') {
    const { error: budgetError } = await supabase.rpc('update_budget_spent', {
      p_user_id: req.user!.id,
      p_category: body.category,
      p_amount: body.amount,
    });

    if (budgetError) {
      // Rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id);

      return errorResponse(res, 'Failed to update budget', 500, budgetError);
    }
  }

  return successResponse(res, { transaction });
}
```

## Error Handling

### Comprehensive Error Handler

```typescript
// api/_lib/error-handler.ts
import { VercelResponse } from '@vercel/node';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(error: unknown, res: VercelResponse) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    error: 'Unknown error occurred',
    timestamp: new Date().toISOString(),
  });
}
```

Usage:

```typescript
import { ApiError, handleError } from './_lib/error-handler';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401);
    }

    // Your logic here

    return successResponse(res, data);
  } catch (error) {
    return handleError(error, res);
  }
}
```

## Advanced Patterns

### Request Caching

```typescript
// api/_lib/cache.ts
const cache = new Map<string, { data: any; expires: number }>();

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCache(key: string, data: any, ttlSeconds: number = 60) {
  cache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}
```

Usage:

```typescript
import { getCached, setCache } from './_lib/cache';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const cacheKey = `user:${req.user!.id}:transactions`;

  // Try cache first
  const cached = getCached(cacheKey);
  if (cached) {
    return successResponse(res, cached);
  }

  // Fetch from database
  const supabase = getSupabaseClient(req);
  const { data } = await supabase.from('transactions').select('*').eq('user_id', req.user!.id);

  // Cache for 5 minutes
  setCache(cacheKey, data, 300);

  return successResponse(res, data);
}
```

### Batch Operations

```typescript
// api/transactions/batch.ts
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  const body = await parseBody<{ transactions: any[] }>(req);

  if (!body || !Array.isArray(body.transactions)) {
    return errorResponse(res, 'Invalid request body', 400);
  }

  const supabase = getSupabaseClient(req);

  // Add user_id to all transactions
  const transactions = body.transactions.map((t) => ({
    ...t,
    user_id: req.user!.id,
  }));

  // Batch insert
  const { data, error } = await supabase.from('transactions').insert(transactions).select();

  if (error) {
    return errorResponse(res, 'Batch insert failed', 500, error);
  }

  return successResponse(res, {
    message: `Successfully created ${data.length} transactions`,
    transactions: data,
  });
}

export default createServerlessHandler(handler, { auth: true });
```

### Webhook Handler

```typescript
// api/webhooks/stripe.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerlessHandler } from '../_lib/serverless-helpers';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['stripe-signature'] as string;

  if (!verifySignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data);
      break;
    case 'payment_intent.failed':
      await handlePaymentFailure(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}

function verifySignature(body: any, signature: string): boolean {
  // Implement signature verification
  return true;
}

async function handlePaymentSuccess(data: any) {
  // Handle successful payment
}

async function handlePaymentFailure(data: any) {
  // Handle failed payment
}

export default createServerlessHandler(handler, {
  auth: false, // Webhooks use signature verification instead
  cors: false,
});
```

## Testing Examples

### Unit Test Example

```typescript
// api/__tests__/transactions.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../transactions';

describe('Transactions API', () => {
  it('should return transactions for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/transactions',
    });

    // Mock authentication
    req.user = { id: 'user-123', email: 'test@example.com' };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });

  it('should return 401 for unauthenticated request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/transactions',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
```

---

These examples cover common patterns and use cases. Adapt them to your specific requirements!
