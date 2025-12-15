# Serverless Deployment Guide

## Quick Start Guide for Deploying Serverless Functions

This guide will help you deploy Budget Buddy's serverless functions to Vercel and other platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Testing Deployed Functions](#testing-deployed-functions)
6. [Alternative Platforms](#alternative-platforms)
7. [Monitoring & Debugging](#monitoring--debugging)

## Prerequisites

### Required Tools

- Node.js 18+ and npm 9+
- Vercel CLI (optional, but recommended)
- Git
- Supabase account and project

### Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Local Development

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-repo/budget-buddy.git
cd budget-buddy

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variables

Create `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: AI Services
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

### 3. Run Local Development Server

```bash
# Option 1: Next.js dev server (includes API routes)
npm run dev

# Option 2: Vercel dev server (simulates serverless environment)
vercel dev
```

### 4. Test Local Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Test with authentication (replace with your session cookie)
curl -H "Cookie: sb-access-token=your-token" \
  http://localhost:3000/api/transactions
```

## Vercel Deployment

### Method 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Login to Vercel

```bash
vercel login
```

#### Step 2: Link Project (First Time Only)

```bash
vercel link
```

Follow the prompts to:

- Select your Vercel account/team
- Link to existing project or create new one
- Confirm project settings

#### Step 3: Deploy to Preview

```bash
vercel
```

This creates a preview deployment for testing.

#### Step 4: Deploy to Production

```bash
vercel --prod
```

### Method 2: Deploy via GitHub Integration

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add serverless functions"
git push origin main
```

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings
5. Click "Deploy"

#### Step 3: Configure Automatic Deployments

- **Production**: Deploys from `main` branch
- **Preview**: Deploys from pull requests

### Method 3: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import Git Repository"
3. Choose your repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Add environment variables (see below)
6. Click "Deploy"

## Environment Configuration

### Setting Environment Variables in Vercel

#### Via Vercel CLI

```bash
# Add production variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Add preview variable
vercel env add NEXT_PUBLIC_SUPABASE_URL preview

# Add development variable
vercel env add NEXT_PUBLIC_SUPABASE_URL development
```

#### Via Vercel Dashboard

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select Production, Preview, and/or Development

### Required Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: AI Services
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
ANTHROPIC_API_KEY=...

# Optional: Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### Importing Environment Variables from File

```bash
# Import from .env.local
vercel env pull .env.local

# Push to Vercel
vercel env add < .env.production
```

## Testing Deployed Functions

### Get Your Deployment URL

After deployment, Vercel provides URLs:

- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-abc123.vercel.app`

### Test Endpoints

#### Health Check (No Auth)

```bash
curl https://your-project.vercel.app/api/health
```

#### Get Transactions (With Auth)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-project.vercel.app/api/transactions
```

#### Create Transaction (With Auth)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "type": "expense",
    "description": "Lunch"
  }' \
  https://your-project.vercel.app/api/transactions
```

### Testing with Postman

1. Import the API collection (create one based on documentation)
2. Set up environment variables:
   - `base_url`: Your Vercel deployment URL
   - `auth_token`: Your authentication token
3. Run the collection

### Automated Testing

Create a test script `test-deployed-api.sh`:

```bash
#!/bin/bash

BASE_URL="https://your-project.vercel.app"

echo "Testing Health Endpoint..."
curl -s "$BASE_URL/api/health" | jq

echo "\nTesting Transactions Endpoint..."
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  "$BASE_URL/api/transactions?limit=5" | jq

echo "\nDone!"
```

Run it:

```bash
chmod +x test-deployed-api.sh
./test-deployed-api.sh
```

## Alternative Platforms

While optimized for Vercel, these serverless functions can be deployed to other platforms:

### AWS Lambda

1. Install Serverless Framework:

```bash
npm install -g serverless
```

2. Create `serverless.yml`:

```yaml
service: budget-buddy-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  api:
    handler: api/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

3. Deploy:

```bash
serverless deploy
```

### Netlify Functions

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Create `netlify.toml`:

```toml
[build]
  functions = "api"

[functions]
  node_bundler = "esbuild"
```

3. Deploy:

```bash
netlify deploy --prod
```

### Google Cloud Functions

1. Install gcloud CLI
2. Deploy individual functions:

```bash
gcloud functions deploy transactions \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point handler \
  --source api
```

### Azure Functions

1. Install Azure Functions Core Tools
2. Create function app:

```bash
func init --worker-runtime node --language typescript
```

3. Deploy:

```bash
func azure functionapp publish your-function-app
```

## Monitoring & Debugging

### Vercel Logs

#### View Real-time Logs

```bash
vercel logs --follow
```

#### Filter by Function

```bash
vercel logs --filter="/api/transactions"
```

#### View Production Logs

```bash
vercel logs --prod
```

### Vercel Dashboard Monitoring

1. Go to your project in Vercel
2. Navigate to **Analytics** tab
3. View:
   - Request count
   - Error rate
   - Response times
   - Bandwidth usage

### Error Tracking

Add error tracking service (e.g., Sentry):

```typescript
// api/_lib/error-tracking.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

export function captureError(error: Error) {
  Sentry.captureException(error);
}
```

### Performance Monitoring

#### Cold Start Analysis

```bash
# Check function initialization time
vercel logs --filter="Cold Boot"
```

#### Response Time Tracking

Add timing headers:

```typescript
const startTime = Date.now();
// ... your logic
res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
```

### Debugging Tips

1. **Enable Verbose Logging**

   ```typescript
   console.log('Debug info:', { req, body, user });
   ```

2. **Use Vercel Dev for Local Debugging**

   ```bash
   vercel dev --debug
   ```

3. **Check Environment Variables**

   ```bash
   vercel env ls
   ```

4. **Test Edge Cases**
   - Missing authentication
   - Invalid input data
   - Rate limiting
   - Large payloads

## Performance Optimization

### 1. Reduce Cold Start Time

```typescript
// Lazy load heavy dependencies
async function handler(req, res) {
  if (needsHeavyLibrary) {
    const heavy = await import('heavy-library');
    // Use it
  }
}
```

### 2. Connection Pooling

```typescript
// Reuse Supabase client across invocations
let supabaseClient: SupabaseClient | null = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}
```

### 3. Response Caching

```typescript
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
```

### 4. Use Edge Functions for Static Data

For data that doesn't require authentication:

```bash
vercel --prod --edge
```

## Rollback Strategy

### Rollback to Previous Deployment

```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>
```

### Instant Rollback in Dashboard

1. Go to **Deployments** tab
2. Find the working deployment
3. Click "Promote to Production"

## Security Best Practices

1. **Always validate input**
2. **Use environment variables for secrets**
3. **Implement rate limiting**
4. **Enable CORS selectively**
5. **Use HTTPS only**
6. **Regularly update dependencies**

```bash
npm audit fix
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Troubleshooting Common Issues

### Issue: Function Timeout

**Solution**: Optimize queries or increase timeout in `vercel.json`

### Issue: Environment Variables Not Found

**Solution**:

```bash
vercel env pull
vercel --prod
```

### Issue: Authentication Fails

**Solution**: Check Supabase URL and anon key are correct

### Issue: CORS Errors

**Solution**: Verify CORS headers in `serverless-helpers.ts`

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Issues](https://github.com/your-repo/issues)

## Next Steps

1. ✅ Deploy to Vercel preview
2. ✅ Test all endpoints
3. ✅ Configure custom domain
4. ✅ Set up monitoring
5. ✅ Deploy to production
6. ✅ Monitor performance
7. ✅ Set up automated backups

---

**Need Help?** Open an issue on GitHub or contact support.
