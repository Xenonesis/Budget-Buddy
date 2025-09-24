# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Package Management
```bash
# Install dependencies
npm install

# Clean install
npm ci
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Export static site
npm run export

# Analyze bundle size
npm run analyze
```

### Database Operations
```bash
# Set up database schema
npm run db:setup

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Reset database (caution - deletes all data)
npm run db:reset

# Check database connection
npm run db:check
```

### Code Quality
```bash
# TypeScript type checking
npm run type-check

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Run all code quality checks
npm run quality
```

### Testing
```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm test:watch

# Run integration tests
npm test:integration

# Run end-to-end tests
npm test:e2e

# Run all tests with coverage
npm test:coverage
```

### Environment Validation
```bash
# Check all environment variables
npm run env:check

# Validate database connection
npm run db:validate

# Test AI provider connections
npm run ai:test

# Run all validation checks
npm run validate
```

## Architecture Overview

Budget Buddy is an AI-powered personal finance management platform built with Next.js 15 and React 19. The application follows a modern component-based architecture with TypeScript for type safety.

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.12, Framer Motion for animations
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with Auth.js integration
- **State Management**: Zustand for global state, React Hook Form for forms
- **AI Integration**: Multi-provider AI system supporting 15+ providers
- **Build Tool**: Turbopack for fast development

### Project Structure

#### Core Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components organized by feature
- `lib/` - Utility functions, database clients, and business logic
- `public/` - Static assets

#### Key Components Architecture

**Authentication Flow**
- Components in `components/auth/` handle all authentication UI
- Supabase manages user sessions and authentication state
- Auth settings stored in user profiles with AI preferences

**Dashboard System**
- Main dashboard at `app/dashboard/page.tsx`
- Modular widget system in `components/dashboard/`
- Real-time data updates via Supabase subscriptions

**AI Integration Layer**
- Core AI logic in `lib/ai.ts` with multi-provider support
- AI insights page at `app/dashboard/ai-insights/`
- Quota management system for API usage limits
- Financial context building for personalized responses

**Transaction Management**
- Transaction components in `components/transactions/`
- OCR receipt scanning with AI-enhanced processing
- Real-time categorization and validation

**Budget System**
- Budget management in `app/dashboard/budget/`
- Flexible period support (weekly, monthly, yearly)
- AI-powered budget recommendations and alerts

### Database Schema

The application uses Supabase with the following key tables:
- `profiles` - User settings including AI configurations
- `transactions` - Financial transactions with categories and metadata
- `budgets` - Budget allocations by category and period
- `categories` - Custom and default expense/income categories
- `ai_conversations` - Chat history with AI assistants

Key views:
- `monthly_spending` - Aggregated spending by month/category
- `budget_vs_actual` - Budget performance tracking

### AI System Architecture

**Multi-Provider Support**
The AI system supports 15+ providers including:
- OpenAI (GPT-4, GPT-3.5)
- Google (Gemini Pro, Flash)
- Anthropic (Claude 3.5 Sonnet, Haiku)
- Mistral, Groq, Cerebras, xAI, and others

**Key AI Features**
- Financial insights generation
- Natural language transaction processing
- Voice interface for hands-free interaction
- Predictive budgeting and spending analysis
- OCR receipt processing

**Privacy & Security**
- All financial data encrypted at rest and in transit
- Zero-knowledge architecture for sensitive operations
- Quota management to prevent API abuse
- Financial disclaimers added to AI responses

### Environment Configuration

Required environment variables:
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_SECRET=your_secret_32_chars_min
NEXTAUTH_URL=http://localhost:3000

# AI Providers (choose one or more)
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
ANTHROPIC_API_KEY=your_anthropic_key
# ... other AI provider keys
```

### Development Workflow

1. **Environment Setup**: Copy `.env.local.example` and configure required variables
2. **Database Setup**: Run `npm run db:setup` to initialize Supabase schema
3. **Development**: Use `npm run dev` for hot-reload development
4. **Code Quality**: Run `npm run quality` before commits
5. **Testing**: Use appropriate test commands for your changes

### Key Patterns

**Component Organization**
- UI components in `components/ui/` with index.ts exports
- Feature components grouped by domain (auth, dashboard, transactions)
- Reusable hooks in `lib/hooks/`

**State Management**
- Global state with Zustand stores
- Local component state for UI-only concerns
- Server state via Supabase real-time subscriptions

**Error Handling**
- Comprehensive error boundaries
- Toast notifications for user feedback
- Structured error logging for debugging

**Performance Optimizations**
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Caching strategies for API responses