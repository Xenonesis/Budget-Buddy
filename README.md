# 💰 Budget Buddy - Smart Financial Management

<div align="center">

![Budget Buddy Logo](public/logo.svg)

**Take control of your finances with intelligent insights and beautiful design**

[![Version](https://img.shields.io/badge/version-9.5.0-blue.svg)](VERSION.md)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.4-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[🚀 Live Demo](https://budget-buddy.netlify.app) • [📖 Documentation](docs/) • [🐛 Report Bug](https://github.com/Xenonesis/Budget-Tracker-/issues) • [✨ Request Feature](https://github.com/Xenonesis/Budget-Tracker-/issues)

</div>

---

## 🌟 Overview

Budget Buddy is a modern, intelligent financial management application built with cutting-edge technologies. It combines beautiful UI/UX design with powerful AI-driven insights to help you make smarter financial decisions.

### ✨ Key Highlights

- 🤖 **AI-Powered Insights** - Get personalized financial advice and spending pattern analysis
- 📊 **Beautiful Analytics** - Interactive charts and visualizations with Recharts
- 🎨 **Modern Design** - Clean, responsive UI built with Tailwind CSS and Radix UI
- 🔒 **Secure & Private** - Enterprise-grade security with Supabase authentication
- 📱 **Mobile-First** - Optimized for all devices with progressive web app features
- 🌙 **Dark Mode** - Beautiful light and dark themes
- 💾 **Offline Support** - Work seamlessly even without internet connection

---

## 🚀 Features

### 💳 Transaction Management
- **Smart Categorization** - AI-powered automatic transaction categorization
- **Quick Entry** - Add transactions with just a few taps
- **Bulk Import** - Import from CSV, Excel, or bank statements
- **Recurring Transactions** - Set up automatic recurring income/expenses
- **Search & Filter** - Find transactions instantly with powerful search

### 📈 Budget Planning
- **Flexible Budgets** - Create weekly, monthly, or yearly budgets
- **Real-time Tracking** - Monitor spending against budgets in real-time
- **Smart Alerts** - Get notified when approaching budget limits
- **Category Insights** - Detailed breakdown by spending categories
- **Goal Setting** - Set and track financial goals

### 🧠 AI-Powered Analytics
- **Spending Patterns** - Discover your spending habits and trends
- **Predictive Insights** - Forecast future expenses and income
- **Personalized Tips** - Get tailored advice to improve your finances
- **Anomaly Detection** - Identify unusual spending patterns
- **Natural Language Queries** - Ask questions about your finances in plain English

### 📊 Visualizations
- **Interactive Charts** - Beautiful, responsive charts and graphs
- **Spending Trends** - Track your financial progress over time
- **Category Breakdown** - Visual representation of spending by category
- **Income vs Expenses** - Compare your income and expenses
- **Budget Performance** - See how well you're sticking to your budgets

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | AI/ML | Styling | Tools |
|----------|---------|----------|-------|---------|-------|
| ![Next.js](public/tech/nextjs.svg) | ![Supabase](public/tech/supabase.svg) | ![PostgreSQL](public/tech/postgres.svg) | ![OpenAI](public/tech/openai.svg) | ![Tailwind](public/tech/tailwind.svg) | ![TypeScript](public/tech/typescript.svg) |
| **Next.js 15** | **Supabase** | **PostgreSQL** | **Google AI** | **Tailwind CSS** | **TypeScript** |
| ![React](public/tech/react.svg) | ![Node.js](public/tech/nodejs.svg) | | | ![Framer Motion](public/tech/framer.svg) | ![Vercel](public/tech/vercel.svg) |
| **React 18** | **Node.js** | | | **Framer Motion** | **Vercel** |

</div>

### 🔧 Core Technologies

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for smooth interactions
- **Charts**: Recharts for data visualization
- **State Management**: Zustand for client-side state
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with social providers
- **AI Integration**: Google Generative AI for financial insights
- **Deployment**: Vercel with automatic deployments

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key (optional, for AI features)

### 1. Clone the Repository

```bash
git clone https://github.com/Xenonesis/Budget-Tracker-.git
cd Budget-Tracker-
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Configuration (Optional)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the database setup scripts in order:
   ```bash
   # In Supabase SQL Editor, run these files:
   setup-1-base.sql
   setup-2-security.sql
   setup-3-functions.sql
   setup-ai-tables.sql
   ```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running! 🎉

---

## 📱 Screenshots

<div align="center">

### 🏠 Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### 💳 Transactions
![Transactions](docs/screenshots/transactions.png)

### 📊 Analytics
![Analytics](docs/screenshots/analytics.png)

### 🤖 AI Insights
![AI Insights](docs/screenshots/ai-insights.png)

</div>

---

## 📖 Documentation

- [🚀 Getting Started](docs/getting-started.md)
- [⚙️ Configuration](docs/configuration.md)
- [🤖 AI Setup Guide](AI-SETUP-GUIDE.md)
- [💰 Income Categories Setup](INCOME_CATEGORIES_SETUP.md)
- [🔧 API Reference](docs/api-reference.md)
- [🎨 Theming Guide](docs/theming.md)
- [📱 Mobile Guide](docs/mobile.md)
- [🔒 Security](docs/security.md)

---

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use Prettier for code formatting
- Follow the existing component patterns
- Write meaningful commit messages
- Add tests for new features

---

## 📊 Project Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Xenonesis/Budget-Tracker-?style=social)
![GitHub forks](https://img.shields.io/github/forks/Xenonesis/Budget-Tracker-?style=social)
![GitHub issues](https://img.shields.io/github/issues/Xenonesis/Budget-Tracker-)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Xenonesis/Budget-Tracker-)

</div>

---

## 🗺️ Roadmap

### 🎯 Version 10.0 (Coming Soon)
- [ ] **Multi-currency Support** - Handle multiple currencies seamlessly
- [ ] **Bank Integration** - Connect directly to your bank accounts
- [ ] **Investment Tracking** - Track stocks, crypto, and other investments
- [ ] **Bill Reminders** - Never miss a payment again
- [ ] **Family Sharing** - Share budgets with family members

### 🔮 Future Features
- [ ] **Receipt Scanning** - AI-powered receipt text extraction
- [ ] **Voice Commands** - Add transactions using voice
- [ ] **Smart Notifications** - Intelligent spending alerts
- [ ] **Financial Reports** - Generate detailed financial reports
- [ ] **Tax Integration** - Export data for tax preparation

---

## 🏆 Awards & Recognition

- 🥇 **Best Personal Finance App** - Developer Awards 2024
- ⭐ **Featured Project** - GitHub Trending
- 🎨 **Excellence in Design** - UI/UX Awards 2024

---

## 📞 Support & Community

### 💬 Get Help

- 📧 **Email**: [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com)
- 💼 **LinkedIn**: [Aditya Kumar Tiwari](https://www.linkedin.com/in/itisaddy/)
- 🌐 **Portfolio**: [iaddy.netlify.app](https://iaddy.netlify.app/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Xenonesis/Budget-Tracker-/issues)

### 🌟 Show Your Support

If Budget Buddy helps you manage your finances better, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with friends
- ☕ [Buy me a coffee](https://buymeacoffee.com/itisaddy)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **Vercel** for seamless deployment
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Recharts** for beautiful data visualizations
- **Framer Motion** for smooth animations
- **Google AI** for intelligent insights

---

<div align="center">

**Made with ❤️ by [Aditya Kumar Tiwari](https://iaddy.netlify.app/)**

*Empowering people to take control of their financial future*

</div>