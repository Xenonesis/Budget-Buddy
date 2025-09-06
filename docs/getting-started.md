# 🚀 Getting Started with Budget Buddy

Welcome to Budget Buddy! This guide will help you get up and running quickly with your new financial management application.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [First-Time Setup](#first-time-setup)
- [Basic Usage](#basic-usage)
- [Next Steps](#next-steps)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Supabase** account (free tier available)
- A **Google AI** account (optional, for AI features)

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.0.0 | 20.0.0+ |
| RAM | 4GB | 8GB+ |
| Storage | 1GB | 2GB+ |
| Browser | Chrome 90+ | Latest Chrome/Firefox |

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Xenonesis/Budget-Tracker-.git
cd Budget-Tracker-
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: AI Features
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-key

# Optional: App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Budget Buddy"
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
5. Wait for the project to be ready

### 2. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public** key
4. Add these to your `.env.local` file

### 3. Run Database Scripts

In your Supabase dashboard, go to **SQL Editor** and run these scripts in order:

```sql
-- 1. Base tables and structure
-- Copy and paste content from setup-1-base.sql

-- 2. Security policies
-- Copy and paste content from setup-2-security.sql

-- 3. Functions and triggers
-- Copy and paste content from setup-3-functions.sql

-- 4. AI tables (optional)
-- Copy and paste content from setup-ai-tables.sql
```

## 🚀 First-Time Setup

### 1. Start the Development Server

```bash
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000)

### 2. Create Your Account

1. Navigate to the application
2. Click **"Get Started"** or **"Sign Up"**
3. Enter your email and password
4. Verify your email (check your inbox)
5. Complete your profile setup

### 3. Configure Your Preferences

1. **Currency**: Set your preferred currency
2. **Timezone**: Configure your timezone
3. **Theme**: Choose light or dark mode
4. **Notifications**: Set up notification preferences

## 💡 Basic Usage

### Adding Your First Transaction

1. Go to **Dashboard** → **Transactions**
2. Click **"Add Transaction"**
3. Fill in the details:
   - **Amount**: Enter the transaction amount
   - **Type**: Select Income or Expense
   - **Category**: Choose or create a category
   - **Description**: Add optional details
   - **Date**: Set the transaction date
4. Click **"Save Transaction"**

### Creating Your First Budget

1. Navigate to **Budget** section
2. Click **"Create Budget"**
3. Select a **category**
4. Set the **budget amount**
5. Choose the **time period** (weekly/monthly/yearly)
6. Click **"Create Budget"**

### Viewing Analytics

1. Go to **Analytics** section
2. Explore different chart views:
   - **Spending Trends**: See your spending over time
   - **Category Breakdown**: Understand where your money goes
   - **Income vs Expenses**: Track your financial balance
   - **Budget Performance**: Monitor budget adherence

## 🤖 Setting Up AI Features (Optional)

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 2. Enable AI Features

1. Go to **Settings** → **AI Configuration**
2. Enter your API key
3. Choose your preferred AI model
4. Save the configuration

### 3. Using AI Insights

1. Navigate to **AI Insights**
2. Ask questions like:
   - "What are my biggest expenses this month?"
   - "How can I save more money?"
   - "Show me my spending patterns"
3. Get personalized financial advice

## 🔧 Customization

### Themes

Budget Buddy supports both light and dark themes:
- Click the theme toggle in the top navigation
- Your preference is automatically saved

### Categories

Create custom categories for better organization:
1. Go to **Transactions** → **Add Transaction**
2. In the category dropdown, click **"Add New Category"**
3. Enter category name and select an icon
4. Choose category type (Income/Expense/Both)

### Currency

Change your currency in **Settings** → **Profile**:
- Supports 25+ international currencies
- Automatic formatting based on locale
- Real-time conversion (coming soon)

## 📱 Mobile Usage

Budget Buddy is fully responsive and works great on mobile:

- **Progressive Web App**: Install on your phone's home screen
- **Offline Support**: Add transactions without internet
- **Touch Optimized**: Designed for mobile interactions
- **Fast Loading**: Optimized for mobile networks

### Installing as PWA

1. Open Budget Buddy in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Follow the installation steps
4. Launch from your home screen

## 🔍 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Database connection issues:**
- Verify your Supabase URL and key
- Check if your project is active
- Ensure RLS policies are properly set

**AI features not working:**
- Verify your Google AI API key
- Check API quota limits
- Ensure the key has proper permissions

### Getting Help

If you encounter issues:

1. Check the [FAQ](docs/faq.md)
2. Search [existing issues](https://github.com/Xenonesis/Budget-Tracker-/issues)
3. Create a [new issue](https://github.com/Xenonesis/Budget-Tracker-/issues/new)
4. Join our [community discussions](https://github.com/Xenonesis/Budget-Tracker-/discussions)

## 🎯 Next Steps

Now that you're set up, explore these features:

- 📊 **[Analytics Guide](analytics.md)** - Master your financial data
- 🤖 **[AI Features](ai-features.md)** - Leverage AI for insights
- 📱 **[Mobile Guide](mobile.md)** - Optimize for mobile usage
- 🔒 **[Security Guide](security.md)** - Keep your data safe
- 🎨 **[Customization](customization.md)** - Make it your own

## 🎉 Welcome to Budget Buddy!

You're all set! Start tracking your finances and take control of your financial future. Remember, the key to successful budgeting is consistency – make it a habit to log your transactions regularly.

Happy budgeting! 💰✨