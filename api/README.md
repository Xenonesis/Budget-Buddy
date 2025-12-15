# Serverless Functions API Documentation

## Overview

This directory contains serverless functions for Budget Buddy that can be deployed to Vercel or any
Node.js serverless platform. These functions are optimized for serverless environments with cold
start optimization, automatic scaling, and built-in security features.

## Architecture

```
api/
├── _lib/                      # Shared utilities and helpers
│   ├── serverless-helpers.ts  # Core serverless utilities
│   └── types.ts               # TypeScript type definitions
├── index.ts                   # API entry point
├── health.ts                  # Health check endpoint
├── transactions.ts            # Transaction management
├── budgets.ts                 # Budget management
├── analytics.ts               # Financial analytics
└── users.ts                   # User profile management
```

## Features

✅ **Authentication**: Built-in Supabase authentication middleware  
✅ **CORS Support**: Automatic CORS handling for all endpoints  
✅ **Rate Limiting**: In-memory rate limiting (can be extended with Redis)  
✅ **Error Handling**: Consistent error responses across all functions  
✅ **Type Safety**: Full TypeScript support with strict typing  
✅ **Vercel Optimized**: Configured for optimal performance on Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### 3. Local Development

```bash
# Run Next.js dev server (includes API routes)
npm run dev

# Or use Vercel CLI for serverless testing
vercel dev
```

### 4. Deploy to Vercel

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## API Endpoints

### Base URL

- **Production**: `https://your-domain.vercel.app/api`
- **Development**: `http://localhost:3000/api`

### Endpoints Overview

| Endpoint            | Methods                | Auth | Description         |
| ------------------- | ---------------------- | ---- | ------------------- |
| `/api`              | GET                    | ❌   | API information     |
| `/api/health`       | GET                    | ❌   | Health check        |
| `/api/transactions` | GET, POST, PUT, DELETE | ✅   | Transaction CRUD    |
| `/api/budgets`      | GET, POST, PUT, DELETE | ✅   | Budget CRUD         |
| `/api/analytics`    | GET                    | ✅   | Financial analytics |
| `/api/users`        | GET, PUT, DELETE       | ✅   | User profile        |

## Detailed API Documentation

### 1. Health Check

**Endpoint**: `GET /api/health`  
**Authentication**: Not required

**Response**:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "environment": "production",
    "uptime": 123.456,
    "memory": {
      "rss": 123456789,
      "heapTotal": 123456789,
      "heapUsed": 123456789,
      "external": 123456789
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Transactions API

#### Get Transactions

**Endpoint**: `GET /api/transactions`  
**Authentication**: Required

**Query Parameters**:

- `limit` (number, default: 50): Number of transactions to return
- `offset` (number, default: 0): Pagination offset
- `type` (string, optional): Filter by type ('income' or 'expense')

**Response**:

```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "total": 100,
    "limit": 50,
    "offset": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Create Transaction

**Endpoint**: `POST /api/transactions`  
**Authentication**: Required

**Request Body**:

```json
{
  "amount": 100.5,
  "category": "Groceries",
  "type": "expense",
  "description": "Weekly grocery shopping",
  "date": "2024-01-01T00:00:00.000Z",
  "merchant": "Walmart",
  "payment_method": "credit_card"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 100.5,
      "category": "Groceries",
      "type": "expense",
      "description": "Weekly grocery shopping",
      "date": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Update Transaction

**Endpoint**: `PUT /api/transactions?id={transaction_id}`  
**Authentication**: Required

**Request Body**: Same as create, but all fields are optional

#### Delete Transaction

**Endpoint**: `DELETE /api/transactions?id={transaction_id}`  
**Authentication**: Required

### 3. Budgets API

#### Get Budgets

**Endpoint**: `GET /api/budgets`  
**Authentication**: Required

**Query Parameters**:

- `period` (string, default: 'monthly'): Budget period ('weekly', 'monthly', 'yearly')

#### Create Budget

**Endpoint**: `POST /api/budgets`  
**Authentication**: Required

**Request Body**:

```json
{
  "category": "Groceries",
  "amount": 500,
  "period": "monthly",
  "start_date": "2024-01-01T00:00:00.000Z",
  "alert_threshold": 80
}
```

#### Update Budget

**Endpoint**: `PUT /api/budgets?id={budget_id}`  
**Authentication**: Required

#### Delete Budget

**Endpoint**: `DELETE /api/budgets?id={budget_id}`  
**Authentication**: Required

### 4. Analytics API

**Endpoint**: `GET /api/analytics`  
**Authentication**: Required

**Query Parameters**:

- `type` (string, required): Analytics type ('summary', 'category', 'trend')
- `start_date` (string, optional): Start date for filtering
- `end_date` (string, optional): End date for filtering

**Response (Summary)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 5000,
      "totalExpenses": 3000,
      "netSavings": 2000,
      "savingsRate": "40.00",
      "transactionCount": 150
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (Category)**:

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "Groceries",
        "income": 0,
        "expenses": 500,
        "transactions": 12
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (Trend)**:

```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "month": "2024-01",
        "income": 5000,
        "expenses": 3000,
        "net": 2000
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5. Users API

#### Get User Profile

**Endpoint**: `GET /api/users`  
**Authentication**: Required

#### Update User Profile

**Endpoint**: `PUT /api/users`  
**Authentication**: Required

**Request Body**:

```json
{
  "full_name": "John Doe",
  "preferred_currency": "USD",
  "timezone": "America/New_York",
  "preferred_language": "en",
  "theme_preference": "dark"
}
```

#### Delete User Account

**Endpoint**: `DELETE /api/users`  
**Authentication**: Required

**Request Body**:

```json
{
  "confirm": true
}
```

## Authentication

All authenticated endpoints require a valid Supabase session cookie. The authentication is handled
automatically by the `createServerlessHandler` wrapper.

### Using Authentication

```typescript
import { createServerlessHandler } from './_lib/serverless-helpers';

export default createServerlessHandler(handler, {
  auth: true, // Enable authentication
  cors: true, // Enable CORS
});
```

### Accessing User Information

In authenticated handlers, user information is available via `req.user`:

```typescript
async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user!.id;
  const userEmail = req.user!.email;
  // Your logic here
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

| Code | Description                                      |
| ---- | ------------------------------------------------ |
| 400  | Bad Request - Invalid input                      |
| 401  | Unauthorized - Missing or invalid authentication |
| 403  | Forbidden - Insufficient permissions             |
| 404  | Not Found - Resource not found                   |
| 405  | Method Not Allowed - HTTP method not supported   |
| 429  | Too Many Requests - Rate limit exceeded          |
| 500  | Internal Server Error - Server error             |

## Rate Limiting

Built-in rate limiting is implemented per IP address:

- Default: 100 requests per minute
- Can be customized via environment variables

```typescript
import { checkRateLimit, getClientIp } from './_lib/serverless-helpers';

const clientIp = getClientIp(req);
if (!checkRateLimit(clientIp, 100, 60000)) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

## Creating Custom Serverless Functions

### Basic Structure

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  AuthenticatedRequest,
  successResponse,
  errorResponse,
} from './_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Your logic here
  return successResponse(res, { message: 'Success' });
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
```

### Helper Functions

#### successResponse

```typescript
successResponse(res, data, (status = 200));
```

#### errorResponse

```typescript
errorResponse(res, message, status = 500, details?);
```

#### parseBody

```typescript
const body = await parseBody<MyType>(req);
```

#### getSupabaseClient

```typescript
const supabase = getSupabaseClient(req);
```

## Performance Optimization

### Cold Start Optimization

- Minimal dependencies
- Lazy loading of heavy modules
- Connection pooling for database

### Caching

- Static responses cached at edge
- API responses with appropriate Cache-Control headers

### Best Practices

1. Keep functions small and focused
2. Use environment variables for configuration
3. Implement proper error handling
4. Add logging for debugging
5. Use TypeScript for type safety

## Deployment

### Vercel Deployment

The `vercel.json` configuration is optimized for serverless functions:

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024,
      "runtime": "@vercel/node@3"
    }
  }
}
```

### Environment Variables

Set these in Vercel dashboard:

1. Go to Project Settings
2. Navigate to Environment Variables
3. Add your variables for Production, Preview, and Development

### Monitoring

Use Vercel's built-in monitoring:

```bash
vercel logs
```

## Testing

### Local Testing

```bash
# Using Next.js dev server
npm run dev

# Using Vercel CLI
vercel dev
```

### Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Get transactions (requires auth)
curl -H "Cookie: your-session-cookie" \
  http://localhost:3000/api/transactions
```

## Troubleshooting

### Common Issues

1. **Authentication fails**
   - Check Supabase environment variables
   - Verify session cookie is being sent
   - Check Supabase project URL and anon key

2. **CORS errors**
   - Ensure CORS is enabled in handler config
   - Check allowed origins in CORS headers

3. **Rate limit exceeded**
   - Adjust rate limit settings
   - Implement Redis-based rate limiting for production

4. **Cold start latency**
   - Use smaller dependencies
   - Implement connection pooling
   - Consider using Vercel Edge Functions for ultra-low latency

## Migration from Next.js API Routes

If you have existing Next.js API routes, you can easily convert them:

**Before (Next.js API Route)**:

```typescript
export async function GET(request: NextRequest) {
  // Logic
}
```

**After (Serverless Function)**:

```typescript
import { createServerlessHandler } from './_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Same logic
}

export default createServerlessHandler(handler, { auth: true });
```

## Support

For issues and questions:

- Check the [GitHub repository](https://github.com/your-repo)
- Review [Vercel documentation](https://vercel.com/docs)
- Check [Supabase documentation](https://supabase.com/docs)

## License

MIT License - see LICENSE file for details
