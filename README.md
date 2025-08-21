# 💰 Budget Buddy - Smart Financial Management

<div align="center">

![Budget Buddy Banner](public/banner.png)

**Take control of your finances with AI-powered insights and beautiful design**

[![Version](https://img.shields.io/badge/version-10.75-blue.svg)](VERSION.md)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[🚀 Live Demo](https://budget-buddy.netlify.app) • [📖 Documentation](docs/) • [🐛 Report Bug](https://github.com/Xenonesis/Budget-Buddy/issues) • [✨ Request Feature](https://github.com/Xenonesis/Budget-Buddy/issues)

</div>

---

## 🌟 Welcome to Budget Buddy

Budget Buddy is a modern, intelligent financial management application built with cutting-edge technologies. It combines beautiful UI/UX design with powerful AI-driven insights to help you make smarter financial decisions and achieve your financial goals.

<div align="center">
  
  [![Product Screenshot](public/dashboard.png)](https://budget-buddy.netlify.app)
  
</div>

### ✨ Why Choose Budget Buddy?

Budget Buddy isn't just another expense tracker. It's a comprehensive financial companion that leverages artificial intelligence to understand your spending patterns, predict future expenses, and provide personalized recommendations to optimize your financial health.

---

## 🚀 Key Features

### 💳 Smart Transaction Management
- **AI-Powered Categorization** - Automatically categorizes transactions using machine learning
- **Bulk Import/Export** - Import from CSV, Excel, or export to PDF/Excel formats
- **Recurring Transactions** - Set up automatic recurring income/expenses with flexible intervals
- **Advanced Search & Filter** - Find transactions instantly with powerful search capabilities
- **Batch Operations** - Edit multiple transactions simultaneously for efficiency

### 📊 Advanced Analytics Dashboard
- **Interactive Charts** - Beautiful visualizations with drill-down capabilities using Recharts
- **Real-time Data** - Live updates with smooth animations and transitions
- **Custom Time Periods** - Analyze data across different date ranges
- **Comparative Analysis** - Compare spending patterns across months and categories
- **Export Reports** - Generate detailed financial reports in multiple formats

### 🧠 AI-Powered Financial Insights
- **Multiple AI Providers** - Support for Google Gemini, Mistral, Claude, Groq, and more
- **Personalized Recommendations** - Tailored advice based on your spending habits
- **Predictive Forecasting** - Forecast future expenses with confidence intervals
- **Anomaly Detection** - Identify unusual spending patterns automatically
- **Natural Language Queries** - Ask questions about your finances in plain English
- **Financial Assistant Chat** - Interactive AI chat for financial guidance

### 🎯 Intelligent Budget Planning
- **Dynamic Budgets** - Create flexible budgets that adapt to your lifestyle
- **Smart Alerts** - Get notified when approaching budget limits
- **Goal Tracking** - Visual progress meters toward financial objectives
- **Category Insights** - Detailed breakdown by spending categories
- **Monthly Reports** - Comprehensive financial summaries

### 🎨 Modern Design System
- **Responsive UI** - Optimized for all devices from mobile to desktop
- **Dark/Light Mode** - Beautiful themes with seamless switching
- **Smooth Animations** - Fluid transitions powered by Framer Motion
- **Accessibility First** - WCAG compliant design for all users
- **Customizable Dashboard** - Drag-and-drop widgets and layouts

### 🔒 Enterprise-Grade Security
- **Bank-Level Encryption** - 256-bit encryption for all sensitive data
- **Supabase Authentication** - Secure user management with row-level security
- **Multi-Factor Authentication** - Enhanced security with biometric support
- **Privacy First** - Your data is never sold or shared with third parties

---

## 🛠️ Modern Tech Stack

<div align="center">

| Category | Technology | Purpose | Version |
|----------|------------|---------|---------|
| **Frontend** | ![Next.js](public/tech/nextjs.svg) Next.js | React Framework | 15.5.0 |
| **Language** | ![TypeScript](public/tech/typescript.svg) TypeScript | Type Safety | 5.9.2 |
| **Styling** | ![Tailwind](public/tech/tailwind.svg) Tailwind CSS | Utility-First CSS | 4.1.12 |
| **UI Components** | Radix UI | Accessible Components | Latest |
| **State Management** | Zustand | Lightweight State | 5.0.8 |
| **Animations** | ![Framer Motion](public/tech/framer.svg) Framer Motion | Smooth Interactions | 12.23.12 |
| **Charts** | Recharts | Data Visualization | 3.1.2 |
| **Backend** | ![Supabase](public/tech/supabase.svg) Supabase | Backend-as-a-Service | 2.55.0 |
| **Database** | ![PostgreSQL](public/tech/postgres.svg) PostgreSQL | Reliable Data Storage | Latest |
| **Authentication** | Supabase Auth | Secure User Management | Latest |
| **AI Integration** | ![Google AI](public/tech/openai.svg) Multiple Providers | Financial Insights | Latest |
| **Deployment** | ![Vercel](public/tech/vercel.svg) Netlify | Global CDN | Latest |

</div>

---

## 📱 Application Screenshots

<div align="center">

### 🏠 Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)
*Comprehensive dashboard with real-time financial insights and interactive charts*

### 💳 Transaction Management
![Transactions](docs/screenshots/transactions.png)
*Advanced transaction management with AI categorization and bulk operations*

### 📊 Financial Analytics
![Analytics](docs/screenshots/dashboard.png)
*Deep insights into spending patterns with predictive analytics*

### 🤖 AI Financial Assistant
![AI Insights](docs/screenshots/dashboard.png)
*Personalized financial advice powered by multiple AI providers*

</div>

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase** account
- **AI API keys** (optional, for AI features)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Xenonesis/Budget-Buddy.git
   cd Budget-Buddy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Copy the environment template:
   ```bash
   cp .env.template .env.local
   ```
   
   Configure your `.env.local` file:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Configuration (Optional - for AI features)
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   
   Run the database setup scripts in your Supabase SQL Editor:
   ```sql
   -- Execute these files in order:
   sql/setup-1-base.sql
   sql/setup-2-security.sql
   sql/setup-3-functions.sql
   sql/setup-ai-tables.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open Your Browser**
   
   Visit [http://localhost:3000](http://localhost:3000) to see your application! 🎉

---

## 🤖 AI Features Setup

Budget Buddy supports multiple AI providers for enhanced financial insights:

### Supported AI Providers
- **Google Gemini** - Versatile model for general financial advice
- **Mistral AI** - Fast and efficient financial analysis
- **Claude (Anthropic)** - Advanced reasoning for complex financial planning
- **Groq** - Ultra-fast processing for real-time insights
- **DeepSeek** - Specialized financial calculations
- **OpenRouter** - Access to multiple models through single API

### Setup Instructions
1. Follow the detailed [AI Setup Guide](AI-SETUP-GUIDE.md)
2. Configure your preferred AI provider in Settings
3. Start chatting with your AI financial assistant!

---

## 📖 Comprehensive Documentation

- [🚀 Getting Started Guide](docs/getting-started.md)
- [⚙️ Configuration Guide](docs/configuration.md)
- [🤖 AI Setup Guide](AI-SETUP-GUIDE.md)
- [💰 Income Categories Setup](INCOME_CATEGORIES_SETUP.md)
- [🔧 API Reference](docs/api-reference.md)
- [🎨 Features Overview](docs/features.md)
- [📱 Mobile Guide](docs/mobile.md)
- [🔒 Security Guide](SECURITY.md)

---

## 🏗️ Project Structure

```
Budget-Buddy/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── auth/             # Authentication pages
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── ui/              # UI components
│   ├── landing/         # Landing page components
│   └── auth/            # Authentication components
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Supabase client
│   ├── utils.ts        # Utility functions
│   ├── store.ts        # Zustand store
│   └── ai.ts           # AI integration
├── sql/                # Database schemas
├── public/             # Static assets
└── docs/              # Documentation
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes: `npm run build`
5. **Commit** changes: `git commit -m 'Add amazing feature'`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Standards

- Follow **TypeScript** best practices
- Use **Prettier** for code formatting
- Follow existing component patterns
- Write meaningful commit messages
- Add tests for new features

---

## 📊 Project Metrics

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Xenonesis/Budget-Buddy?style=social)
![GitHub forks](https://img.shields.io/github/forks/Xenonesis/Budget-Buddy?style=social)
![GitHub issues](https://img.shields.io/github/issues/Xenonesis/Budget-Buddy)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Xenonesis/Budget-Buddy)

</div>

---

## 🗺️ Roadmap

### 🎯 Version 11.0 (Planned)
- [ ] **Multi-currency Support** - Handle multiple currencies seamlessly
- [ ] **Bank Integration** - Connect directly to bank accounts via Plaid
- [ ] **Investment Tracking** - Track stocks, crypto, and other investments
- [ ] **Bill Reminders** - Smart notifications for upcoming payments
- [ ] **Family Sharing** - Share budgets with family members

### 🔮 Long-term Vision
- [ ] **Receipt Scanning** - AI-powered receipt text extraction
- [ ] **Voice Commands** - Add transactions using voice input
- [ ] **Smart Notifications** - Intelligent spending alerts
- [ ] **Tax Integration** - Export data for tax preparation
- [ ] **Financial Reports** - Generate comprehensive financial reports

---

## 🏆 Recognition & Awards

- 🥇 **Best Personal Finance App** - Developer Awards 2024
- ⭐ **Featured Project** - GitHub Trending
- 🎨 **Excellence in Design** - UI/UX Awards 2024

---

## 📞 Support & Connect

### 💬 Get Help

- 📧 **Email**: [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com)
- 💼 **LinkedIn**: [Aditya Kumar Tiwari](https://www.linkedin.com/in/itisaddy/)
- 🌐 **Portfolio**: [iaddy.netlify.app](https://iaddy.netlify.app/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Xenonesis/Budget-Buddy/issues)

### 🌟 Show Your Support

If Budget Buddy helps you manage your finances better, please consider:

<div align="center">
  
  [![Star on GitHub](https://img.shields.io/badge/⭐_Star_on_GitHub-gray?style=social)](https://github.com/Xenonesis/Budget-Buddy)
  [![Follow on Twitter](https://img.shields.io/badge/Follow_on_Twitter-1DA1F2?style=social&logo=twitter)](https://twitter.com/itisaddy7)
  [![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-FFDD00?style=social&logo=buy-me-a-coffee)](https://buymeacoffee.com/itisaddy)
  
</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Special thanks to the amazing open-source community and these fantastic tools:

- **Supabase** for the incredible backend platform
- **Vercel/Netlify** for seamless deployment
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Recharts** for beautiful data visualizations
- **Framer Motion** for smooth animations
- **Google AI & Other AI Providers** for intelligent insights
- **Next.js Team** for the amazing React framework

---

<div align="center">

**Made with ❤️ by [Aditya Kumar Tiwari](https://iaddy.netlify.app/)**

*Empowering people to take control of their financial future*

[![Twitter](https://img.shields.io/twitter/follow/itisaddy7?style=social)](https://twitter.com/itisaddy7)
[![GitHub](https://img.shields.io/github/followers/Xenonesis?style=social)](https://github.com/Xenonesis)

---

### 🔥 Latest Updates

**Version 10.75** - Landing page refactoring complete with improved performance and maintainability

**Version 10.70** - Enhanced dashboard UI with virtualized lists and advanced transaction management

**Version 10.65** - Comprehensive financial analytics with interactive charts and export capabilities

**Version 10.60** - AI-powered insights with multiple provider support and predictive forecasting

[View Full Changelog](CHANGELOG.md)

</div>