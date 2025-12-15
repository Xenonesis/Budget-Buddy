# Serverless Functions Integration Guide

## 🎯 Quick Reference

You now have **two ways** to use serverless functions in your Budget Buddy application:

### 1. **Next.js App Router (Recommended for Development)** ✅

- Location: `app/api/`
- Uses: Next.js App Router with integrated helpers
- Testing: `npm run dev` → Works immediately
- Status: **Fully Integrated & Tested** ✅

### 2. **Standalone Vercel Functions**

- Location: `api/`
- Uses: Pure Vercel serverless functions
- Testing: `vercel dev` → Requires Vercel CLI
- Status: **Ready for Vercel Deployment** 🚀

---

## ✅ What's Working Now (Integrated)

### Available Endpoints

| Endpoint                     | Method    | Auth | Description                     |
| ---------------------------- | --------- | ---- | ------------------------------- |
| `/api/demo/serverless`       | GET, POST | ❌   | Demo endpoint with all features |
| `/api/demo/authenticated`    | GET       | ✅   | Protected demo endpoint         |
| `/api/transactions/enhanced` | GET, POST | ✅   | Enhanced transaction CRUD       |

### Helper Functions Available

Import from `app/api/_lib/nextjs-adapter.ts`:

```typescript
import {
  createNextHandler, // Main wrapper with middleware
  successResponse, // Standard success response
  errorResponse, // Standard error response
  parseBody, // Parse JSON body safely
  getSupabaseClient, // Get Supabase client
  authenticateRequest, // Manual authentication
  applyRateLimit, // Rate limiting
  getClientIp, // Get client IP
} from '../_lib/nextjs-adapter';
```

---

## 🚀 Quick Start - Using the Helpers

### Example 1: Simple Public Endpoint

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest } from 'next/server';
import { createNextHandler, successResponse } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  return successResponse({
    message: 'Hello from my endpoint!',
    timestamp: new Date().toISOString(),
  });
}

export const GET = createNextHandler(handler, {
  auth: false, // Public endpoint
  cors: true, // Enable CORS
});
```

### Example 2: Protected Endpoint with Database

```typescript
// app/api/my-data/route.ts
import { NextRequest } from 'next/server';
import {
  createNextHandler,
  successResponse,
  errorResponse,
  getSupabaseClient,
} from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const user = (request as any).user; // Injected by auth middleware
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from('my_table').select('*').eq('user_id', user.id);

  if (error) {
    return errorResponse('Failed to fetch data', 500, error);
  }

  return successResponse({ items: data });
}

export const GET = createNextHandler(handler, {
  auth: true, // Requires authentication
  cors: true,
});
```

### Example 3: POST Endpoint with Validation

```typescript
// app/api/create-item/route.ts
import { NextRequest } from 'next/server';
import {
  createNextHandler,
  successResponse,
  errorResponse,
  parseBody,
  getSupabaseClient,
} from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const user = (request as any).user;
  const body = await parseBody<{ name: string; description: string }>(request);

  // Validation
  if (!body || !body.name) {
    return errorResponse('Name is required', 400);
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('items')
    .insert({
      name: body.name,
      description: body.description || '',
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return errorResponse('Failed to create item', 500, error);
  }

  return successResponse({ item: data }, 201);
}

export const POST = createNextHandler(handler, {
  auth: true,
  cors: true,
});
```

---

## 🧪 Testing Locally

### Start Development Server

```bash
npm run dev
```

### Test Public Endpoint

```bash
curl http://localhost:3000/api/demo/serverless
```

### Test POST Endpoint

```bash
curl -X POST http://localhost:3000/api/demo/serverless \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "Hello"}'
```

### Test with Query Parameters

```bash
curl "http://localhost:3000/api/demo/serverless?echo=HelloWorld"
```

### Test Protected Endpoint (will fail without auth)

```bash
curl http://localhost:3000/api/demo/authenticated
# Returns: 401 Unauthorized
```

---

## 📖 Documentation Structure

### For Next.js Integration (Current)

- **`app/api/_lib/README.md`** - How to use helpers in Next.js
- **`SERVERLESS_TEST_RESULTS.md`** - Test results & verification
- **`INTEGRATION_GUIDE.md`** - This file

### For Standalone Deployment (Vercel)

- **`GET_STARTED_SERVERLESS.md`** - Getting started
- **`api/README.md`** - Complete API reference
- **`api/QUICK_START.md`** - 5-minute setup
- **`api/EXAMPLES.md`** - Code examples
- **`SERVERLESS_DEPLOYMENT_GUIDE.md`** - Deploy to Vercel
- **`SERVERLESS_SETUP_CHECKLIST.md`** - Pre-deployment checks

---

## 🎯 Common Use Cases

### 1. Create a New Public API Endpoint

```typescript
// app/api/public-data/route.ts
import { NextRequest } from 'next/server';
import { createNextHandler, successResponse } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  // Your logic here
  return successResponse({ data: 'public data' });
}

export const GET = createNextHandler(handler, {
  auth: false,
  cors: true,
});
```

### 2. Create a Protected Endpoint

```typescript
// app/api/user-profile/route.ts
import { NextRequest } from 'next/server';
import { createNextHandler, successResponse } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const user = (request as any).user;
  return successResponse({ userId: user.id });
}

export const GET = createNextHandler(handler, {
  auth: true, // ← Authentication required
  cors: true,
});
```

### 3. Handle Multiple Methods

```typescript
// app/api/items/route.ts
import { NextRequest } from 'next/server';
import { createNextHandler, successResponse, parseBody } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  if (request.method === 'GET') {
    // Handle GET
    return successResponse({ items: [] });
  }

  if (request.method === 'POST') {
    // Handle POST
    const body = await parseBody(request);
    return successResponse({ created: body }, 201);
  }
}

export const GET = createNextHandler(handler, { auth: true });
export const POST = createNextHandler(handler, { auth: true });
```

### 4. Add Rate Limiting

```typescript
import { applyRateLimit } from '../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  // Apply rate limit: 5 requests per minute
  const rateLimitError = applyRateLimit(request, 5, 60000);
  if (rateLimitError) {
    return rateLimitError;
  }

  // Your logic here
  return successResponse({ data: 'limited' });
}
```

---

## 🔧 Configuration Options

### createNextHandler Config

```typescript
createNextHandler(handler, {
  auth: boolean,        // Require authentication (default: false)
  cors: boolean,        // Enable CORS (default: true)
  methods: string[],    // Allowed methods (optional)
});
```

### Examples

```typescript
// Public endpoint with CORS
export const GET = createNextHandler(handler, {
  auth: false,
  cors: true,
});

// Protected endpoint, only GET and POST
export const GET = createNextHandler(handler, {
  auth: true,
  cors: true,
  methods: ['GET', 'POST'],
});

// Public, no CORS
export const GET = createNextHandler(handler, {
  auth: false,
  cors: false,
});
```

---

## 🎓 Learning Path

### Beginner

1. Test the demo endpoints
2. Read `app/api/_lib/README.md`
3. Create a simple public endpoint
4. Test with curl or Postman

### Intermediate

5. Create a protected endpoint
6. Add database operations
7. Implement validation
8. Test error cases

### Advanced

9. Add rate limiting
10. Create complex CRUD operations
11. Implement custom middleware
12. Deploy to production

---

## 📊 Architecture Overview

```
Request Flow (Next.js Integration):

Client Request
     ↓
Next.js App Router
     ↓
createNextHandler()
     ├─→ CORS Handling
     ├─→ Method Validation
     ├─→ Authentication (if enabled)
     └─→ Your Handler
          ├─→ parseBody()
          ├─→ getSupabaseClient()
          └─→ successResponse() / errorResponse()
     ↓
Client Response (with CORS headers)
```

---

## 🚀 Deploy to Production

### Option 1: Deploy as Next.js App (Current Setup)

```bash
vercel --prod
```

All `app/api/` routes deploy automatically!

### Option 2: Use Standalone Functions

See `SERVERLESS_DEPLOYMENT_GUIDE.md` for deploying standalone `api/` functions.

---

## 🆘 Troubleshooting

### "Module not found" error

```bash
# Make sure you're in the right directory
cd Budget-Buddy
npm install
```

### Authentication not working

```typescript
// Make sure .env.local has Supabase credentials
NEXT_PUBLIC_SUPABASE_URL = your_url;
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_key;
```

### CORS errors

```typescript
// Ensure CORS is enabled in config
export const GET = createNextHandler(handler, {
  cors: true, // ← Make sure this is true
});
```

### Rate limiting too strict

```typescript
// Adjust the limits
const rateLimitError = applyRateLimit(
  request,
  100, // Max requests
  60000 // Window in ms (1 minute)
);
```

---

## 📞 Support

- **Quick Reference:** `app/api/_lib/README.md`
- **Examples:** `api/EXAMPLES.md`
- **Full Docs:** `api/README.md`
- **Deployment:** `SERVERLESS_DEPLOYMENT_GUIDE.md`
- **Test Results:** `SERVERLESS_TEST_RESULTS.md`

---

## ✅ Summary

You now have:

- ✅ Serverless helpers integrated into Next.js
- ✅ Working demo endpoints to learn from
- ✅ Enhanced transaction endpoint as example
- ✅ All features tested and verified
- ✅ Complete documentation
- ✅ Ready for production use

**Start building your endpoints now!** 🚀

```bash
# Test the demo
curl http://localhost:3000/api/demo/serverless

# See it in action
curl -X POST http://localhost:3000/api/demo/serverless \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

Happy coding! 💻✨
