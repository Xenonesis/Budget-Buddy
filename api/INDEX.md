# Serverless Functions - Index

Welcome to Budget Buddy's serverless functions! This index will help you navigate all available
resources.

## 🚀 Getting Started

**New to serverless?** Start here:

1. **[GET_STARTED_SERVERLESS.md](../GET_STARTED_SERVERLESS.md)** - Complete beginner's guide (10 min
   read)
2. **[QUICK_START.md](./QUICK_START.md)** - Fast setup guide (5 min)
3. **[README.md](./README.md)** - Full API documentation

## 📚 Documentation

### For Developers

| Document                                                         | What's Inside            | When to Use                 |
| ---------------------------------------------------------------- | ------------------------ | --------------------------- |
| **[QUICK_START.md](./QUICK_START.md)**                           | 5-minute setup guide     | Getting started quickly     |
| **[README.md](./README.md)**                                     | Complete API reference   | Looking up endpoint details |
| **[EXAMPLES.md](./EXAMPLES.md)**                                 | Code examples & patterns | Building custom functions   |
| **[../GET_STARTED_SERVERLESS.md](../GET_STARTED_SERVERLESS.md)** | Comprehensive guide      | First-time setup            |

### For Deployment

| Document                                                                               | What's Inside             | When to Use              |
| -------------------------------------------------------------------------------------- | ------------------------- | ------------------------ |
| **[../SERVERLESS_DEPLOYMENT_GUIDE.md](../SERVERLESS_DEPLOYMENT_GUIDE.md)**             | Complete deployment guide | Deploying to production  |
| **[../SERVERLESS_SETUP_CHECKLIST.md](../SERVERLESS_SETUP_CHECKLIST.md)**               | Pre-deployment checklist  | Before going live        |
| **[../SERVERLESS_IMPLEMENTATION_SUMMARY.md](../SERVERLESS_IMPLEMENTATION_SUMMARY.md)** | What was implemented      | Understanding the system |

## 🎯 API Endpoints

### Available Functions

| File              | Endpoint            | Methods                | Auth Required |
| ----------------- | ------------------- | ---------------------- | ------------- |
| `index.ts`        | `/api`              | GET                    | ❌            |
| `health.ts`       | `/api/health`       | GET                    | ❌            |
| `transactions.ts` | `/api/transactions` | GET, POST, PUT, DELETE | ✅            |
| `budgets.ts`      | `/api/budgets`      | GET, POST, PUT, DELETE | ✅            |
| `analytics.ts`    | `/api/analytics`    | GET                    | ✅            |
| `users.ts`        | `/api/users`        | GET, PUT, DELETE       | ✅            |

## 🛠️ Helper Libraries

### Core Utilities (`_lib/serverless-helpers.ts`)

- `createServerlessHandler()` - Main handler wrapper
- `authenticateRequest()` - Authentication middleware
- `successResponse()` - Success response helper
- `errorResponse()` - Error response helper
- `parseBody()` - JSON body parser
- `getSupabaseClient()` - Supabase client factory
- `applyCors()` - CORS handling
- `checkRateLimit()` - Rate limiting
- `getClientIp()` - IP address extraction

### Type Definitions (`_lib/types.ts`)

- `AuthenticatedRequest` - Request with user info
- `ServerlessConfig` - Handler configuration
- `ApiResponse<T>` - Standard response type
- `Transaction` - Transaction interface
- `Budget` - Budget interface
- `UserProfile` - User profile interface
- Plus 15+ more types

## 📖 Quick Reference

### Common Tasks

```typescript
// Create a simple endpoint
import { createServerlessHandler, successResponse } from './_lib/serverless-helpers';

async function handler(req, res) {
  return successResponse(res, { message: 'Hello!' });
}

export default createServerlessHandler(handler, { auth: false });
```

```typescript
// Create an authenticated endpoint
export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
```

```typescript
// Access user info
async function handler(req: AuthenticatedRequest, res) {
  const userId = req.user!.id;
  // Your logic here
}
```

### Testing Commands

```bash
# Start development
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health

# Run test suite
bash scripts/test-serverless.sh

# Deploy to Vercel
vercel --prod
```

## 🎓 Learning Path

### Beginner

1. Read [GET_STARTED_SERVERLESS.md](../GET_STARTED_SERVERLESS.md)
2. Follow [QUICK_START.md](./QUICK_START.md)
3. Test the health endpoint
4. Review [EXAMPLES.md](./EXAMPLES.md) for simple patterns

### Intermediate

1. Study existing endpoints (`transactions.ts`, `budgets.ts`)
2. Review [README.md](./README.md) for API details
3. Create a custom endpoint
4. Test with authentication
5. Deploy to preview

### Advanced

1. Study helper functions in `_lib/serverless-helpers.ts`
2. Review advanced patterns in [EXAMPLES.md](./EXAMPLES.md)
3. Implement custom middleware
4. Add caching layer
5. Deploy to production with monitoring

## 🔧 Configuration Files

| File                         | Purpose                        |
| ---------------------------- | ------------------------------ |
| `tsconfig.json`              | TypeScript configuration       |
| `.gitignore`                 | Git ignore rules               |
| `.vercelignore`              | Vercel ignore rules            |
| `../vercel.json`             | Vercel deployment config       |
| `../.env.serverless.example` | Environment variables template |

## 📊 Architecture Overview

```
Request Flow:
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  Vercel Edge Network         │
│  (CDN, SSL, DDoS Protection) │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Serverless Function         │
│  ┌────────────────────────┐  │
│  │ createServerlessHandler│  │
│  ├────────────────────────┤  │
│  │ • CORS                 │  │
│  │ • Authentication       │  │
│  │ • Rate Limiting        │  │
│  │ • Error Handling       │  │
│  └────────┬───────────────┘  │
│           │                  │
│           ▼                  │
│  ┌────────────────────────┐  │
│  │   Your Handler Logic   │  │
│  └────────┬───────────────┘  │
└───────────┼──────────────────┘
            │
            ▼
    ┌───────────────┐
    │   Supabase    │
    │   Database    │
    └───────────────┘
```

## 🆘 Troubleshooting

### Quick Fixes

| Problem                | Solution                     | Documentation                                             |
| ---------------------- | ---------------------------- | --------------------------------------------------------- |
| Can't start dev server | Run `npm install`            | [QUICK_START.md](./QUICK_START.md)                        |
| TypeScript errors      | Check dependencies installed | [GET_STARTED_SERVERLESS.md](../GET_STARTED_SERVERLESS.md) |
| Auth not working       | Verify `.env.local`          | [DEPLOYMENT_GUIDE](../SERVERLESS_DEPLOYMENT_GUIDE.md)     |
| CORS errors            | Check handler config         | [README.md](./README.md)                                  |
| Can't deploy           | Review checklist             | [SETUP_CHECKLIST.md](../SERVERLESS_SETUP_CHECKLIST.md)    |

## 🔗 External Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 📦 Dependencies

### Required

- `@vercel/node` - Vercel Node.js runtime
- `@supabase/ssr` - Supabase server-side auth
- `@supabase/supabase-js` - Supabase client

### Development

- `typescript` - Type checking
- `@types/node` - Node.js types

## 🎯 Next Steps

Choose your path:

### 🚀 I want to deploy now

→ Read [SERVERLESS_DEPLOYMENT_GUIDE.md](../SERVERLESS_DEPLOYMENT_GUIDE.md)

### 💻 I want to develop locally

→ Follow [QUICK_START.md](./QUICK_START.md)

### 📖 I want to understand everything

→ Read [README.md](./README.md)

### 🎓 I want to see examples

→ Check [EXAMPLES.md](./EXAMPLES.md)

### ✅ I'm ready for production

→ Use [SETUP_CHECKLIST.md](../SERVERLESS_SETUP_CHECKLIST.md)

---

## Summary

You have access to:

- ✅ **6 API Endpoints** - Production-ready functions
- ✅ **15+ Helper Functions** - Reusable utilities
- ✅ **20+ Type Definitions** - Full type safety
- ✅ **7 Documentation Files** - Comprehensive guides
- ✅ **30+ Code Examples** - Real-world patterns
- ✅ **2 Test Scripts** - Automated testing

**Everything you need to build and deploy serverless functions!**

---

**Questions?** Check the documentation or open an issue on GitHub.

**Ready to start?** Head to [GET_STARTED_SERVERLESS.md](../GET_STARTED_SERVERLESS.md)!
