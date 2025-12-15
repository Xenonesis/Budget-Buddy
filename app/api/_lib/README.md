# Next.js API Helpers

Enhanced utilities for Next.js App Router API routes with serverless best practices.

## Quick Start

```typescript
import { NextRequest } from 'next/server';
import {
  createNextHandler,
  successResponse,
  errorResponse,
  parseBody,
} from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const body = await parseBody(request);
  return successResponse({ message: 'Success!', data: body });
}

export const GET = createNextHandler(handler, {
  auth: true, // Requires authentication
  cors: true, // Enable CORS
});
```

## Available Utilities

### `createNextHandler(handler, config)`

Main wrapper for API routes with built-in middleware.

**Config Options:**

- `auth: boolean` - Require authentication (default: false)
- `cors: boolean` - Enable CORS (default: true)
- `methods: string[]` - Allowed HTTP methods

**Example:**

```typescript
export const GET = createNextHandler(handler, {
  auth: true,
  cors: true,
  methods: ['GET', 'POST'],
});
```

### `successResponse(data, status?)`

Returns a standardized success response.

```typescript
return successResponse({ user: userData }, 200);
// Returns: { success: true, data: {...}, timestamp: "..." }
```

### `errorResponse(message, status?, details?)`

Returns a standardized error response.

```typescript
return errorResponse('Not found', 404);
// Returns: { error: "Not found", timestamp: "..." }
```

### `parseBody<T>(request)`

Safely parse JSON body from request.

```typescript
const body = await parseBody<{ name: string }>(request);
if (!body || !body.name) {
  return errorResponse('Invalid body', 400);
}
```

### `getSupabaseClient()`

Get authenticated Supabase client for App Router.

```typescript
const supabase = await getSupabaseClient();
const { data, error } = await supabase.from('users').select('*');
```

### `authenticateRequest(request)`

Manually authenticate a request (useful for custom middleware).

```typescript
const { user, error } = await authenticateRequest(request);
if (error) {
  return errorResponse('Unauthorized', 401);
}
```

### `applyRateLimit(request, maxRequests?, windowMs?)`

Apply rate limiting to requests.

```typescript
const rateLimitError = applyRateLimit(request, 10, 60000); // 10 req/min
if (rateLimitError) {
  return rateLimitError;
}
```

### `getClientIp(request)`

Extract client IP address from request.

```typescript
const ip = getClientIp(request);
console.log('Request from:', ip);
```

## Examples

### Public Endpoint

```typescript
// app/api/public/route.ts
import { createNextHandler, successResponse } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  return successResponse({ message: 'Public endpoint' });
}

export const GET = createNextHandler(handler, {
  auth: false,
  cors: true,
});
```

### Authenticated Endpoint

```typescript
// app/api/protected/route.ts
import { createNextHandler, successResponse } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const user = (request as any).user; // Injected by auth middleware
  return successResponse({ userId: user.id });
}

export const GET = createNextHandler(handler, {
  auth: true,
  cors: true,
});
```

### CRUD Endpoint

```typescript
// app/api/items/route.ts
import {
  createNextHandler,
  successResponse,
  errorResponse,
  parseBody,
  getSupabaseClient,
} from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const supabase = await getSupabaseClient();
  const user = (request as any).user;

  if (request.method === 'GET') {
    const { data } = await supabase.from('items').select('*').eq('user_id', user.id);
    return successResponse({ items: data });
  }

  if (request.method === 'POST') {
    const body = await parseBody(request);
    const { data } = await supabase
      .from('items')
      .insert({ ...body, user_id: user.id })
      .select()
      .single();
    return successResponse({ item: data }, 201);
  }

  return errorResponse('Method not allowed', 405);
}

export const GET = createNextHandler(handler, { auth: true });
export const POST = createNextHandler(handler, { auth: true });
```

## Type Definitions

All types are available in `types.ts`:

```typescript
import type {
  Transaction,
  Budget,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
} from '../_lib/types';
```

## See Also

- [Demo Endpoint](../demo/serverless/route.ts)
- [Authenticated Demo](../demo/authenticated/route.ts)
- [Enhanced Transactions](../transactions/enhanced/route.ts)
