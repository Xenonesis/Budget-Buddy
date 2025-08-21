# 💰 Budget Buddy - Smart Financial Management

<div align="center">

![Budget Buddy Banner](public/banner.png)

**Take control of your finances with intelligent insights and beautiful design**

[![Version](https://img.shields.io/badge/version-10.75-blue.svg)](VERSION.md)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[🚀 Live Demo](https://budget-buddy.netlify.app) • [📖 Documentation](docs/) • [🐛 Report Bug](https://github.com/Xenonesis/Budget-Buddy/issues) • [✨ Request Feature](https://github.com/Xenonesis/Budget-Buddy/issues)

</div>

---

## 🌟 Welcome to Budget Buddy

Budget Buddy is a modern, intelligent financial management application built with cutting-edge technologies. It combines beautiful UI/UX design with powerful AI-driven insights to help you make smarter financial decisions.

<div align="center">
  
  [![Product ScreenShot](public/dashboard.png)](https://budget-buddy.netlify.app)
  
</div>

### ✨ Why Budget Buddy?

Budget Buddy isn't just another expense tracker. It's a comprehensive financial companion that helps you understand your spending patterns, predict future expenses, and achieve your financial goals with minimal effort.

---

## 🚀 Key Features

### 💳 Smart Transaction Management
- **AI-Powered Categorization** - Automatically categorizes your transactions
- **Bulk Import** - Import from CSV, Excel, or bank statements
- **Recurring Transactions** - Set up automatic recurring income/expenses
- **Search & Filter** - Find transactions instantly with powerful search

### 📈 Advanced Budget Planning
- **Flexible Budgets** - Create weekly, monthly, or yearly budgets
- **Real-time Tracking** - Monitor spending against budgets in real-time
- **Smart Alerts** - Get notified when approaching budget limits
- **Category Insights** - Detailed breakdown by spending categories

### 🧠 AI-Powered Analytics
- **Spending Patterns** - Discover your spending habits and trends
- **Predictive Insights** - Forecast future expenses and income
- **Personalized Tips** - Get tailored advice to improve your finances
- **Natural Language Queries** - Ask questions about your finances in plain English

### 🎨 Beautiful Design System
- **Responsive UI** - Optimized for all devices from mobile to desktop
- **Dark/Light Mode** - Beautiful themes that adapt to your preference
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Accessibility** - WCAG compliant design for all users

---

## 🛠️ Modern Tech Stack

<div align="center">

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | ![Next.js](public/tech/nextjs.svg) Next.js 14 | React Framework |
| **Language** | ![TypeScript](public/tech/typescript.svg) TypeScript | Type Safety |
| **Styling** | ![Tailwind](public/tech/tailwind.svg) Tailwind CSS | Utility-First CSS |
| **UI Components** | Radix UI + Custom | Accessible Components |
| **State Management** | Zustand | Lightweight State |
| **Animations** | ![Framer Motion](public/tech/framer.svg) Framer Motion | Smooth Interactions |
| **Charts** | Recharts | Data Visualization |
| **Backend** | ![Supabase](public/tech/supabase.svg) Supabase | Backend-as-a-Service |
| **Database** | ![PostgreSQL](public/tech/postgres.svg) PostgreSQL | Reliable Data Storage |
| **Authentication** | ![Supabase Auth](public/tech/supabase.svg) Supabase Auth | Secure User Management |
| **AI** | ![Google AI](public/tech/openai.svg) Google Generative AI | Financial Insights |
| **Deployment** | ![Vercel](public/tech/vercel.svg) Vercel | Global CDN |

</div>

---

## 📱 Screenshots

<div align="center">

### 🏠 Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)
*Beautiful dashboard with all your financial information at a glance*

### 💳 Transaction Management
![Transactions](docs/screenshots/transactions.png)
*Easily add, edit, and categorize your transactions*

### 📊 Financial Analytics
![Analytics](docs/screenshots/dashboard.png)
*Deep insights into your spending patterns and trends*

### 🤖 AI Insights
![AI Insights](docs/screenshots/dashboard.png)
*Personalized financial advice powered by AI*

</div>

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key (optional, for AI features)

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

4. **Database Setup**
   Run the database setup scripts in order:
   ```bash
   # In Supabase SQL Editor, run these files from the sql directory:
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

Visit [http://localhost:3000](http://localhost:3000) to see your application running! 🎉

---

## 📖 Comprehensive Documentation

- [🚀 Getting Started Guide](docs/getting-started.md)
- [⚙️ Configuration Guide](docs/configuration.md)
- [🤖 AI Setup Guide](AI-SETUP-GUIDE.md)
- [💰 Income Categories Setup](INCOME_CATEGORIES_SETUP.md)
- [🔧 API Reference](docs/api-reference.md)
- [🎨 Theming Guide](docs/theming.md)
- [📱 Mobile Guide](docs/mobile.md)
- [🔒 Security Guide](docs/security.md)

---

## 🤝 Community & Contributing

We love contributions from the community! Here's how you can help:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use Prettier for code formatting
- Follow the existing component patterns
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

## 🗺️ Future Roadmap

### 🎯 Version 11.0 (Planned)
- [ ] **Multi-currency Support** - Handle multiple currencies seamlessly
- [ ] **Bank Integration** - Connect directly to your bank accounts
- [ ] **Investment Tracking** - Track stocks, crypto, and other investments
- [ ] **Bill Reminders** - Never miss a payment again
- [ ] **Family Sharing** - Share budgets with family members

### 🔮 Long-term Vision
- [ ] **Receipt Scanning** - AI-powered receipt text extraction
- [ ] **Voice Commands** - Add transactions using voice
- [ ] **Smart Notifications** - Intelligent spending alerts
- [ ] **Financial Reports** - Generate detailed financial reports
- [ ] **Tax Integration** - Export data for tax preparation

---

## 🏆 Recognition

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

[![Twitter](https://img.shields.io/twitter/follow/itisaddy7?style=social)](https://twitter.com/itisaddy7)
[![GitHub](https://img.shields.io/github/followers/Xenonesis?style=social)](https://github.com/Xenonesis)

</div>