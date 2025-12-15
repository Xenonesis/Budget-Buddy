# 🚀 Get Started with Serverless Functions

**Welcome!** This guide will get your Budget Buddy serverless functions up and running in under 10
minutes.

## 🎯 What You'll Get

- ✅ 6 Production-ready serverless API endpoints
- ✅ Full authentication & security
- ✅ Vercel-optimized deployment
- ✅ Complete documentation & examples

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies (1 minute)

```bash
npm install --legacy-peer-deps
```

### Step 2: Configure Environment (2 minutes)

Create `.env.local`:

```bash
cp .env.serverless.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

### Step 4: Test It! (1 minute)

Open your browser or use curl:

```bash
curl http://localhost:3000/api/health
```

You should see:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**🎉 Congratulations! Your serverless functions are running!**

## 📚 What's Available

### API Endpoints

| Endpoint            | What It Does             |
| ------------------- | ------------------------ |
| `/api/health`       | Check if API is running  |
| `/api/transactions` | Manage income & expenses |
| `/api/budgets`      | Set and track budgets    |
| `/api/analytics`    | Get financial insights   |
| `/api/users`        | Manage user profile      |

### Documentation

| Document                                           | Purpose               |
| -------------------------------------------------- | --------------------- |
| **[Quick Start](./api/QUICK_START.md)**            | Get started fast      |
| **[API Docs](./api/README.md)**                    | Complete reference    |
| **[Examples](./api/EXAMPLES.md)**                  | Code examples         |
| **[Deployment](./SERVERLESS_DEPLOYMENT_GUIDE.md)** | Deploy to production  |
| **[Checklist](./SERVERLESS_SETUP_CHECKLIST.md)**   | Pre-deployment checks |

## 🚢 Deploy to Production (3 Steps)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login & Link

```bash
vercel login
vercel link
```

### 3. Deploy

```bash
vercel --prod
```

**That's it!** Your API is live at `https://your-app.vercel.app/api`

## 🧪 Test Your Deployment

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Get transactions (need auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.vercel.app/api/transactions
```

## 💡 Common Tasks

### Create a Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "type": "expense",
    "description": "Lunch"
  }'
```

### Get Analytics

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics?type=summary"
```

### Update Budget

```bash
curl -X PUT "http://localhost:3000/api/budgets?id=BUDGET_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 600}'
```

## 🎓 Next Steps

### For Developers

1. **Explore Examples**: Check out `api/EXAMPLES.md` for code patterns
2. **Read API Docs**: Full reference in `api/README.md`
3. **Create Custom Endpoints**: Follow the patterns in existing files

### For Deployment

1. **Review Checklist**: Go through `SERVERLESS_SETUP_CHECKLIST.md`
2. **Follow Deployment Guide**: Detailed steps in `SERVERLESS_DEPLOYMENT_GUIDE.md`
3. **Set Up Monitoring**: Configure Vercel analytics and logging

### For Testing

1. **Local Tests**: Run `bash scripts/test-serverless.sh`
2. **Manual Testing**: Use Postman or curl
3. **Production Tests**: Test your deployed endpoints

## 📖 Understanding the Structure

```
api/
├── index.ts              # Main entry point
├── health.ts             # Health check
├── transactions.ts       # Transaction CRUD
├── budgets.ts            # Budget management
├── analytics.ts          # Financial analytics
├── users.ts              # User profiles
└── _lib/
    ├── serverless-helpers.ts  # Utilities
    └── types.ts              # TypeScript types
```

## 🔧 Configuration

### Function Settings (vercel.json)

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30, // Max execution time (seconds)
      "memory": 1024, // Memory allocation (MB)
      "runtime": "@vercel/node@3"
    }
  }
}
```

### Environment Variables

Set in Vercel dashboard or `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Optional: AI API keys, rate limit settings, etc.

## 🆘 Need Help?

### Troubleshooting

**Problem**: Cannot connect to API

- Check if dev server is running: `npm run dev`
- Verify port 3000 is not in use

**Problem**: Authentication fails

- Verify Supabase credentials in `.env.local`
- Check if you're sending auth token correctly

**Problem**: CORS errors

- CORS is enabled by default
- Check your request headers include proper Origin

### Get Support

- 📖 Read the [Full Documentation](./api/README.md)
- 🐛 Check [Troubleshooting Guide](./SERVERLESS_DEPLOYMENT_GUIDE.md#troubleshooting-common-issues)
- 💬 Open an issue on GitHub
- 📧 Contact support

## ✨ Features Included

### Authentication

```typescript
// Automatic authentication
export default createServerlessHandler(handler, {
  auth: true, // Requires valid session
});
```

### Error Handling

```typescript
// Consistent error responses
return errorResponse(res, 'Error message', 500);
```

### Type Safety

```typescript
// Full TypeScript support
interface Transaction {
  amount: number;
  category: string;
  type: 'income' | 'expense';
}
```

### Rate Limiting

```typescript
// Built-in protection
if (!checkRateLimit(clientIp, 100, 60000)) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

## 🎯 Example Use Cases

### Personal Finance App

- Track income and expenses
- Set and monitor budgets
- Get spending insights

### Business Dashboard

- Monitor transactions
- Analyze spending patterns
- Generate reports

### Financial API

- Provide data to mobile apps
- Integrate with third-party services
- Power web applications

## 🌟 Key Benefits

✅ **Fast Deployment** - Deploy in minutes, not hours  
✅ **Auto-Scaling** - Handles traffic spikes automatically  
✅ **Zero Config** - Pre-configured for best practices  
✅ **Type-Safe** - Full TypeScript support  
✅ **Secure** - Authentication & rate limiting built-in  
✅ **Well-Documented** - Comprehensive guides & examples

## 📊 What Gets Deployed

When you deploy, you get:

- **6 API Endpoints** - Ready to use
- **Authentication System** - Supabase integration
- **Error Handling** - Consistent responses
- **CORS Support** - Cross-origin ready
- **Rate Limiting** - Protection included
- **Type Definitions** - TypeScript types
- **Documentation** - Complete reference

## 🚀 Ready to Build?

You now have everything you need:

1. ✅ Serverless functions running locally
2. ✅ Complete documentation
3. ✅ Code examples
4. ✅ Deployment guide
5. ✅ Testing scripts

**Start building your next feature!**

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build               # Build for production
npm run type-check          # Check TypeScript

# Testing
bash scripts/test-serverless.sh        # Run tests
curl http://localhost:3000/api/health  # Health check

# Deployment
vercel                      # Deploy preview
vercel --prod              # Deploy production
vercel logs                # View logs
```

### Essential Files

- `api/README.md` - Complete API documentation
- `api/EXAMPLES.md` - Code examples
- `SERVERLESS_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `SERVERLESS_SETUP_CHECKLIST.md` - Pre-deployment checklist

---

**Happy coding!** 💻✨

Questions? Check the [documentation](./api/README.md) or open an issue.
