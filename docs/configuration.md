# ⚙️ Configuration Guide

This guide covers all configuration options available in Budget Buddy, from basic setup to advanced customization.

## 📋 Table of Contents

- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [AI Configuration](#ai-configuration)
- [Theme Configuration](#theme-configuration)
- [Performance Optimization](#performance-optimization)
- [Security Settings](#security-settings)

## 🌍 Environment Variables

### Required Variables

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables

```env
# AI Features
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Budget Buddy"
NEXT_PUBLIC_APP_VERSION="9.5.0"

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_PWA=true

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=false
```

### Environment-Specific Configurations

#### Development (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG_MODE=true
```

#### Production (.env.production)
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
NEXT_PUBLIC_APP_URL=https://budget-buddy.com
NEXT_PUBLIC_DEBUG_MODE=false
```

## 🗄️ Database Configuration

### Supabase Setup

1. **Project Settings**
   ```sql
   -- Enable required extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. **Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

3. **Performance Indexes**
   ```sql
   -- Optimize query performance
   CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
   CREATE INDEX idx_transactions_category ON transactions(category_id);
   CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
   ```

### Connection Pooling

```typescript
// lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'budget-buddy'
    }
  }
})
```

## 🤖 AI Configuration

### Google AI Setup

1. **API Key Configuration**
   ```typescript
   // lib/ai.ts
   const AI_CONFIG = {
     apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
     model: 'gemini-pro',
     generationConfig: {
       temperature: 0.7,
       topK: 40,
       topP: 0.95,
       maxOutputTokens: 1024,
     },
     safetySettings: [
       {
         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
       }
     ]
   }
   ```

2. **Model Selection**
   ```typescript
   const AVAILABLE_MODELS = {
     'gemini-pro': {
       name: 'Gemini Pro',
       description: 'Best for complex financial analysis',
       maxTokens: 30720,
       costPer1kTokens: 0.0005
     },
     'gemini-pro-vision': {
       name: 'Gemini Pro Vision',
       description: 'For receipt scanning and image analysis',
       maxTokens: 16384,
       costPer1kTokens: 0.0025
     }
   }
   ```

### AI Feature Toggles

```typescript
// lib/config.ts
export const AI_FEATURES = {
  insights: process.env.NEXT_PUBLIC_ENABLE_AI_INSIGHTS === 'true',
  categorization: process.env.NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION === 'true',
  forecasting: process.env.NEXT_PUBLIC_ENABLE_AI_FORECASTING === 'true',
  chatbot: process.env.NEXT_PUBLIC_ENABLE_AI_CHATBOT === 'true'
}
```

## 🎨 Theme Configuration

### Custom Theme Variables

```css
/* app/globals.css */
:root {
  /* Primary Colors */
  --primary: 220 90% 56%;
  --primary-foreground: 220 90% 98%;
  
  /* Secondary Colors */
  --secondary: 220 14.3% 95.9%;
  --secondary-foreground: 220.9 39.3% 11%;
  
  /* Accent Colors */
  --accent: 220 14.3% 95.9%;
  --accent-foreground: 220.9 39.3% 11%;
  
  /* Status Colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
  
  /* Chart Colors */
  --chart-1: 220 90% 56%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}

.dark {
  --primary: 220 90% 56%;
  --primary-foreground: 220 90% 98%;
  
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.mjs
const config = {
  theme: {
    extend: {
      colors: {
        // Custom color palette
        budget: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        },
        expense: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d'
        },
        income: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out'
      }
    }
  }
}
```

## ⚡ Performance Optimization

### Next.js Configuration

```javascript
// next.config.js
const nextConfig = {
  // Bundle Analysis
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true'
  },
  
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30 // 30 days
  },
  
  // Compression
  compress: true,
  
  // Experimental Features
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-icons'
    ]
  }
}
```

### Caching Strategy

```typescript
// lib/cache.ts
export const CACHE_CONFIG = {
  // Static data cache duration
  categories: 60 * 60, // 1 hour
  exchangeRates: 60 * 60 * 6, // 6 hours
  
  // Dynamic data cache duration
  transactions: 60 * 5, // 5 minutes
  budgets: 60 * 10, // 10 minutes
  
  // AI responses cache
  aiInsights: 60 * 60 * 24, // 24 hours
}
```

### Code Splitting

```typescript
// Dynamic imports for better performance
const AIInsights = dynamic(() => import('@/components/AIInsights'), {
  loading: () => <AIInsightsSkeleton />,
  ssr: false
})

const Charts = dynamic(() => import('@/components/Charts'), {
  loading: () => <ChartsSkeleton />
})
```

## 🔒 Security Settings

### Content Security Policy

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com;
      style-src 'self' 'unsafe-inline' *.googleapis.com;
      img-src 'self' data: blob: *.supabase.co;
      connect-src 'self' *.supabase.co *.googleapis.com;
      font-src 'self' *.googleapis.com *.gstatic.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### Authentication Configuration

```typescript
// lib/auth.ts
export const AUTH_CONFIG = {
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  
  providers: {
    email: true,
    google: process.env.NEXT_PUBLIC_GOOGLE_AUTH === 'true',
    github: process.env.NEXT_PUBLIC_GITHUB_AUTH === 'true'
  },
  
  security: {
    requireEmailVerification: true,
    passwordMinLength: 8,
    enableMFA: false
  }
}
```

## 📱 PWA Configuration

### Manifest Configuration

```json
// public/manifest.json
{
  "name": "Budget Buddy",
  "short_name": "Budget Buddy",
  "description": "Smart Financial Management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'budget-buddy-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/transactions',
  '/budget',
  '/analytics'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})
```

## 🌐 Internationalization

### i18n Configuration

```javascript
// next.config.js
const nextConfig = {
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'pt', 'zh'],
    defaultLocale: 'en',
    localeDetection: true
  }
}
```

### Currency Configuration

```typescript
// lib/currency.ts
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' }
}
```

## 🔧 Development Tools

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 📊 Monitoring & Analytics

### Error Tracking

```typescript
// lib/monitoring.ts
export const errorTracking = {
  captureException: (error: Error, context?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.error('Error captured:', error, context)
    }
  },
  
  captureMessage: (message: string, level: 'info' | 'warning' | 'error') => {
    if (process.env.NODE_ENV === 'production') {
      console[level](message)
    }
  }
}
```

### Performance Monitoring

```typescript
// lib/performance.ts
export const performanceMonitoring = {
  measurePageLoad: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0]
        console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart)
      })
    }
  }
}
```

---

*For more advanced configuration options, check our [GitHub repository](https://github.com/Xenonesis/Budget-Tracker-) or reach out to our [support team](mailto:itisaddy7@gmail.com).*