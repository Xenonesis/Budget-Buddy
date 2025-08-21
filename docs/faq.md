# ❓ Frequently Asked Questions

Find answers to the most common questions about Budget Buddy. Can't find what you're looking for? [Contact our support team](mailto:itisaddy7@gmail.com).

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Features & Functionality](#features--functionality)
- [Technical Issues](#technical-issues)
- [Security & Privacy](#security--privacy)
- [Billing & Pricing](#billing--pricing)

## 🌟 General Questions

### What is Budget Buddy?

Budget Buddy is a modern, AI-powered financial management application that helps you track expenses, manage budgets, and gain insights into your spending patterns. Built with cutting-edge technologies like Next.js, Supabase, and Google AI, it provides a beautiful and intuitive way to manage your finances.

### Is Budget Buddy free to use?

Yes! Budget Buddy is completely free and open-source. You can use all core features without any cost. The only expenses you might incur are:
- Supabase hosting (free tier available)
- Google AI API usage (optional, for AI features)
- Custom domain hosting (optional)

### What makes Budget Buddy different from other budgeting apps?

- **AI-Powered Insights**: Get personalized financial advice and spending analysis
- **Modern Design**: Beautiful, responsive interface built with the latest technologies
- **Privacy-First**: Your data stays secure with enterprise-grade encryption
- **Open Source**: Full transparency and community-driven development
- **Offline Support**: Works even without internet connection
- **Customizable**: Fully customizable categories, themes, and preferences

### Can I use Budget Buddy on my phone?

Absolutely! Budget Buddy is fully responsive and works great on all devices. You can also install it as a Progressive Web App (PWA) on your phone for a native app-like experience.

## 🚀 Getting Started

### How do I set up Budget Buddy?

1. **Clone the repository** from GitHub
2. **Install dependencies** with `npm install`
3. **Set up Supabase** account and database
4. **Configure environment variables**
5. **Run the application** with `npm run dev`

For detailed instructions, see our [Getting Started Guide](getting-started.md).

### Do I need technical knowledge to use Budget Buddy?

For using the application: **No technical knowledge required**. The interface is designed to be intuitive and user-friendly.

For self-hosting: **Basic technical knowledge helpful** but not required. We provide detailed setup guides and support.

### What are the system requirements?

**For Users:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for initial setup and sync)
- 1GB available storage (for offline data)

**For Self-Hosting:**
- Node.js 18+
- 4GB RAM minimum (8GB recommended)
- 2GB storage space

### How do I import my existing financial data?

Currently, you can:
- **Manual Entry**: Add transactions one by one
- **CSV Import**: Import from spreadsheets (coming soon)
- **Bank Integration**: Connect bank accounts (roadmap item)

We're working on more import options. Check our [roadmap](README.md#roadmap) for updates.

## 💡 Features & Functionality

### How does the AI feature work?

Budget Buddy uses Google's Generative AI to analyze your spending patterns and provide personalized insights. The AI can:
- Categorize transactions automatically
- Identify spending trends and anomalies
- Provide personalized financial advice
- Answer questions about your finances in natural language

**Privacy Note**: Your financial data is processed securely and is not stored by Google.

### Can I create custom categories?

Yes! You can create unlimited custom categories with:
- Custom names and icons
- Income, expense, or both types
- Color coding for easy identification
- Subcategories (coming soon)

### How do budgets work?

Budgets in Budget Buddy are flexible and powerful:
- **Multiple Periods**: Weekly, monthly, or yearly budgets
- **Category-Based**: Set budgets for specific spending categories
- **Real-Time Tracking**: See your progress in real-time
- **Smart Alerts**: Get notified when approaching limits
- **Rollover Options**: Unused budget can roll over (coming soon)

### Can I track multiple currencies?

Currently, Budget Buddy supports setting one primary currency per account. Multi-currency support is on our roadmap for version 10.0.

### Does Budget Buddy work offline?

Yes! Budget Buddy includes offline support:
- **Add Transactions**: Record transactions without internet
- **View Data**: Access your financial data offline
- **Automatic Sync**: Data syncs when connection is restored
- **Conflict Resolution**: Smart handling of sync conflicts

### Can I export my data?

Yes, you can export your data in multiple formats:
- **PDF Reports**: Beautiful financial reports
- **Excel/CSV**: Raw data for analysis
- **JSON**: Complete data backup
- **Print-Friendly**: Formatted for printing

## 🔧 Technical Issues

### The app won't load. What should I do?

1. **Check your internet connection**
2. **Clear browser cache and cookies**
3. **Try a different browser**
4. **Disable browser extensions temporarily**
5. **Check if JavaScript is enabled**

If the issue persists, [contact support](mailto:itisaddy7@gmail.com).

### I'm getting a "Database connection error"

This usually means:
1. **Supabase credentials are incorrect** - Check your environment variables
2. **Database is down** - Check Supabase status page
3. **Network issues** - Try refreshing or check your connection
4. **RLS policies** - Ensure Row Level Security is properly configured

### Transactions aren't syncing

1. **Check internet connection**
2. **Log out and log back in**
3. **Clear browser cache**
4. **Check Supabase dashboard** for any issues
5. **Verify RLS policies** are correctly set up

### The AI features aren't working

1. **Check API key** - Ensure Google AI API key is valid
2. **Check quota** - Verify you haven't exceeded API limits
3. **Check permissions** - Ensure API key has proper permissions
4. **Try again later** - There might be temporary service issues

### Performance is slow

1. **Clear browser cache**
2. **Close unnecessary browser tabs**
3. **Check internet speed**
4. **Update your browser**
5. **Disable browser extensions**

For persistent performance issues, try:
- Using Chrome or Firefox for best performance
- Enabling hardware acceleration in browser settings
- Reducing the number of transactions displayed at once

## 🔒 Security & Privacy

### Is my financial data secure?

Yes! Budget Buddy implements enterprise-grade security:
- **End-to-end encryption** for all data
- **Secure authentication** with Supabase Auth
- **Row Level Security** ensures data isolation
- **Regular security audits** and updates
- **No third-party data sharing**

### Who can see my financial data?

Only you can see your financial data. Budget Buddy implements strict data isolation:
- **Your data is yours** - We cannot access your financial information
- **Zero-knowledge architecture** - Even we can't see your data
- **Secure by design** - Built with privacy as a core principle

### How is my data backed up?

- **Automatic backups** via Supabase infrastructure
- **Point-in-time recovery** available
- **Geographic redundancy** for disaster recovery
- **User-controlled exports** for personal backups

### Can I delete my account and data?

Yes, you have full control:
- **Account deletion** removes all personal data
- **Data export** before deletion if desired
- **Immediate effect** - deletion is permanent
- **GDPR compliant** data handling

### What happens if I forget my password?

1. **Use password reset** on the login page
2. **Check your email** for reset instructions
3. **Create a new password**
4. **Log in with new credentials**

If you don't receive the reset email, check your spam folder or [contact support](mailto:itisaddy7@gmail.com).

## 💰 Billing & Pricing

### Is Budget Buddy really free?

Yes! Budget Buddy is completely free to use. However, you may incur costs for:

**Optional Services:**
- **Supabase hosting** (free tier: 500MB database, 2GB bandwidth)
- **Google AI API** (free tier: limited requests per month)
- **Custom domain** (if you want your own URL)

### What are the Supabase costs?

Supabase offers generous free tiers:
- **Free Tier**: 500MB database, 2GB bandwidth, 50MB file storage
- **Pro Tier**: $25/month for larger usage
- **Team Tier**: $599/month for organizations

Most personal users stay within the free tier limits.

### What are the Google AI costs?

Google AI pricing is very affordable:
- **Free Tier**: 15 requests per minute, 1500 requests per day
- **Paid Usage**: $0.0005 per 1K characters (input), $0.0015 per 1K characters (output)

Typical monthly cost for personal use: $1-5.

### Can I use Budget Buddy without AI features?

Absolutely! All core budgeting features work without AI:
- Transaction tracking
- Budget management
- Analytics and charts
- Data export
- Offline support

Simply don't configure the Google AI API key to disable AI features.

### Are there any hidden costs?

No hidden costs! Budget Buddy is transparent about all potential expenses:
- The application itself is free
- Hosting costs depend on your usage
- AI features have clear, usage-based pricing
- All costs are optional and under your control

## 🤝 Support & Community

### How do I get help?

1. **Check this FAQ** for common questions
2. **Read the documentation** for detailed guides
3. **Search GitHub issues** for similar problems
4. **Create a new issue** if you find a bug
5. **Email support** for personalized help

### How can I contribute to Budget Buddy?

We welcome contributions! You can:
- **Report bugs** and suggest features
- **Submit pull requests** with improvements
- **Improve documentation**
- **Share with friends** and on social media
- **Star the repository** on GitHub

See our [Contributing Guide](../CONTRIBUTING.md) for details.

### Where can I find the latest updates?

- **GitHub Repository**: [Latest releases and code](https://github.com/Xenonesis/Budget-Tracker-)
- **Changelog**: [Version history](../CHANGELOG.md)
- **LinkedIn**: [Developer updates](https://www.linkedin.com/in/itisaddy/)
- **Portfolio**: [Project showcase](https://iaddy.netlify.app/)

### How do I report a bug?

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** on GitHub
3. **Include details**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and device information
   - Screenshots if applicable

### Can I request new features?

Yes! We love feature requests:
1. **Check the roadmap** to see if it's already planned
2. **Create a feature request** on GitHub
3. **Explain the use case** and why it would be valuable
4. **Engage with the community** to gather support

---

## 📞 Still Need Help?

If you can't find the answer you're looking for:

- 📧 **Email**: [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com)
- 💼 **LinkedIn**: [Aditya Kumar Tiwari](https://www.linkedin.com/in/itisaddy/)
- 🐛 **GitHub Issues**: [Report a Problem](https://github.com/Xenonesis/Budget-Tracker-/issues)
- 💬 **Discussions**: [Community Forum](https://github.com/Xenonesis/Budget-Tracker-/discussions)

We typically respond within 24 hours and are always happy to help! 😊