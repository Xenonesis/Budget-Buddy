# 🚀 Deployment Guide

This guide covers deploying Budget Buddy to various platforms, from development to production environments.

## 📋 Table of Contents

- [Quick Deploy](#quick-deploy)
- [Platform-Specific Guides](#platform-specific-guides)
- [Environment Setup](#environment-setup)
- [Database Migration](#database-migration)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Maintenance](#monitoring--maintenance)

## ⚡ Quick Deploy

### One-Click Deployments

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Xenonesis/Budget-Tracker-)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Xenonesis/Budget-Tracker-)

### Prerequisites Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Domain name ready (optional)
- [ ] SSL certificate (handled by platform)

## 🌐 Platform-Specific Guides

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic optimizations.

#### 1. Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
```

#### 2. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-key
```

#### 3. Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias your-deployment.vercel.app yourdomain.com
```

#### 4. Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Netlify

#### 1. Build Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

#### 2. Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- Add all required environment variables
- Enable "Deploy previews" for testing

### Docker Deployment

#### 1. Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  budget-buddy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_GOOGLE_AI_API_KEY=${NEXT_PUBLIC_GOOGLE_AI_API_KEY}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - budget-buddy
    restart: unless-stopped
```

### AWS Deployment

#### 1. AWS Amplify
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

#### 2. AWS Lambda (Serverless)
```yaml
# serverless.yml
service: budget-buddy

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    memory: 512
    timeout: 30
```

## 🔧 Environment Setup

### Production Environment Variables

```env
# Production .env
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key

# AI Services
NEXT_PUBLIC_GOOGLE_AI_API_KEY=prod-google-ai-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="Budget Buddy"

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true

# Security
NEXT_PUBLIC_CSP_NONCE=random-nonce-value
```

### Staging Environment

```env
# Staging .env
NODE_ENV=staging

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NEXT_PUBLIC_DEBUG_MODE=true

# Feature Flags (for testing)
NEXT_PUBLIC_ENABLE_BETA_FEATURES=true
```

## 🗄️ Database Migration

### Pre-deployment Checklist

1. **Backup Current Database**
   ```sql
   -- Create backup
   pg_dump -h your-host -U postgres your-db > backup.sql
   ```

2. **Run Migration Scripts**
   ```bash
   # Run in order
   psql -f setup-1-base.sql
   psql -f setup-2-security.sql
   psql -f setup-3-functions.sql
   psql -f setup-ai-tables.sql
   ```

3. **Verify Migration**
   ```sql
   -- Check table structure
   \dt
   
   -- Verify RLS policies
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### Database Performance Optimization

```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_transactions_user_date 
ON transactions(user_id, date DESC);

CREATE INDEX CONCURRENTLY idx_transactions_category 
ON transactions(category_id);

CREATE INDEX CONCURRENTLY idx_budgets_user_category 
ON budgets(user_id, category_id);

-- Update table statistics
ANALYZE transactions;
ANALYZE categories;
ANALYZE budgets;
```

## ⚡ Performance Optimization

### Build Optimization

```javascript
// next.config.js
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30
  },
  
  // Enable compression
  compress: true,
  
  // Optimize bundle
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true
  }
}
```

### CDN Configuration

```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL || ''

const nextConfig = {
  assetPrefix: CDN_URL,
  
  // Configure headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}
```

### Database Connection Pooling

```typescript
// lib/db.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    global: {
      headers: {
        'x-application-name': 'budget-buddy'
      }
    }
  }
)
```

## 📊 Monitoring & Maintenance

### Health Checks

```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'OK', // Add actual DB check
      ai_service: 'OK', // Add actual AI service check
      memory: process.memoryUsage()
    }
  }
  
  res.status(200).json(healthcheck)
}
```

### Error Monitoring

```typescript
// lib/monitoring.ts
export const errorReporting = {
  captureException: (error: Error, context?: any) => {
    // Send to your error reporting service
    console.error('Error:', error, context)
    
    // Example: Sentry integration
    // Sentry.captureException(error, { extra: context })
  }
}
```

### Performance Monitoring

```typescript
// lib/analytics.ts
export const performanceMonitoring = {
  trackPageView: (page: string) => {
    // Track page views
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: page,
        page_location: window.location.href
      })
    }
  },
  
  trackEvent: (action: string, category: string, label?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label
      })
    }
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Automated Testing

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

## 🚨 Rollback Strategy

### Quick Rollback

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Manual rollback
git revert HEAD
git push origin main
```

### Database Rollback

```sql
-- Restore from backup
psql -h your-host -U postgres your-db < backup.sql

-- Or use point-in-time recovery
-- (Available in Supabase Pro plans)
```

## 📞 Support & Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Clear cache and reinstall dependencies

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure database is accessible

3. **Performance Issues**
   - Enable compression
   - Optimize images
   - Use CDN for static assets

### Getting Help

- 📧 **Email**: support@budget-buddy.com
- 📚 **Documentation**: [docs.budget-buddy.com](https://docs.budget-buddy.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Xenonesis/Budget-Tracker-/issues)

---

*For more deployment options and advanced configurations, check our [GitHub repository](https://github.com/Xenonesis/Budget-Tracker-) or contact our support team.*