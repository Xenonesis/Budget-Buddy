# 🤝 Contributing to Budget Buddy

<div align="center">

![Contributing Banner](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=200&fit=crop&crop=center)

**Help us build the future of financial management!**

[![Contributors](https://img.shields.io/github/contributors/Xenonesis/Budget-Tracker-?style=for-the-badge)](https://github.com/Xenonesis/Budget-Tracker-/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/Xenonesis/Budget-Tracker-?style=for-the-badge)](https://github.com/Xenonesis/Budget-Tracker-/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Xenonesis/Budget-Tracker-?style=for-the-badge)](https://github.com/Xenonesis/Budget-Tracker-/pulls)
[![License](https://img.shields.io/github/license/Xenonesis/Budget-Tracker-?style=for-the-badge)](LICENSE)

</div>

Thank you for your interest in contributing to Budget Buddy! We're excited to have you join our community of developers working to make financial management accessible and enjoyable for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and welcoming environment for everyone. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome people of all backgrounds and experience levels
- **Be Collaborative**: Work together to build something amazing
- **Be Patient**: Help others learn and grow
- **Be Constructive**: Provide helpful feedback and suggestions

## 🌟 Ways to Contribute

### 🐛 Bug Reports

Found a bug? Help us fix it!

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or videos
   - Browser/device information
   - Console errors (if any)

### ✨ Feature Requests

Have an idea for a new feature?

1. **Check the roadmap** to see if it's already planned
2. **Search existing feature requests**
3. **Use the feature request template**
4. **Explain the use case** and why it would be valuable
5. **Provide mockups or examples** if possible

### 🔧 Code Contributions

Ready to write some code?

- **Bug fixes**: Fix reported issues
- **New features**: Implement requested features
- **Performance improvements**: Optimize existing code
- **UI/UX enhancements**: Improve the user experience
- **Tests**: Add or improve test coverage
- **Documentation**: Improve or add documentation

### 📚 Documentation

Help improve our documentation:

- **Fix typos and errors**
- **Add missing information**
- **Create tutorials and guides**
- **Improve code comments**
- **Translate documentation**

### 🎨 Design Contributions

- **UI/UX improvements**
- **Icon design**
- **Illustrations**
- **Brand assets**
- **Accessibility improvements**

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **Supabase** account (free)
- **Google AI** account (optional, for AI features)

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Budget-Tracker-.git
cd Budget-Tracker-

# Add the original repository as upstream
git remote add upstream https://github.com/Xenonesis/Budget-Tracker-.git
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file:

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: AI Features
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-key

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a Supabase project
2. Run the setup scripts in order:
   - `setup-1-base.sql`
   - `setup-2-security.sql`
   - `setup-3-functions.sql`
   - `setup-ai-tables.sql`

### 5. Start Development

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app running!

## 🔄 Development Workflow

### Branch Strategy

We use **GitHub Flow** for our development workflow:

```bash
# 1. Create a feature branch from main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... code, test, commit ...

# 3. Push to your fork
git push origin feature/your-feature-name

# 4. Create a Pull Request
```

### Branch Naming

Use descriptive branch names:

- `feature/add-dark-mode`
- `fix/transaction-sync-issue`
- `docs/update-readme`
- `refactor/optimize-charts`
- `test/add-budget-tests`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description

feat(auth): add Google OAuth integration
fix(budget): resolve calculation error in monthly budgets
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(api): optimize transaction queries
test(budget): add unit tests for budget calculations
```

### Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests and linting**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

3. **Create a descriptive PR**:
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Describe testing performed

4. **Respond to feedback**:
   - Address review comments
   - Update code as needed
   - Keep the conversation constructive

## 📝 Code Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Define proper types** and interfaces
- **Avoid `any` type** unless absolutely necessary
- **Use strict mode** settings

```typescript
// Good
interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: Date
}

// Avoid
const transaction: any = { ... }
```

### React Best Practices

- **Use functional components** with hooks
- **Follow naming conventions**:
  - Components: `PascalCase`
  - Files: `kebab-case.tsx`
  - Functions: `camelCase`
- **Use proper prop types**
- **Implement error boundaries**

```tsx
// Good component structure
interface TransactionCardProps {
  transaction: Transaction
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete 
}: TransactionCardProps) {
  // Component logic
}
```

### Styling

- **Use Tailwind CSS** for styling
- **Follow the design system**
- **Use CSS variables** for theming
- **Ensure responsive design**
- **Test accessibility**

```tsx
// Good styling approach
<button className="
  bg-primary text-primary-foreground 
  hover:bg-primary/90 
  px-4 py-2 rounded-md 
  transition-colors
  focus:outline-none focus:ring-2 focus:ring-primary
">
  Save Transaction
</button>
```

### Performance

- **Use React.memo** for expensive components
- **Implement proper loading states**
- **Optimize images** and assets
- **Use dynamic imports** for code splitting
- **Minimize bundle size**

```tsx
// Good performance practices
const ExpensiveChart = memo(({ data }: ChartProps) => {
  const memoizedData = useMemo(() => 
    processChartData(data), [data]
  )
  
  return <Chart data={memoizedData} />
})

// Dynamic import
const AIInsights = dynamic(() => import('./AIInsights'), {
  loading: () => <Skeleton className="h-64" />
})
```

## 🧪 Testing

### Test Structure

```
tests/
├── __mocks__/          # Mock files
├── components/         # Component tests
├── pages/             # Page tests
├── utils/             # Utility tests
└── setup.ts           # Test setup
```

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionCard } from './TransactionCard'

describe('TransactionCard', () => {
  const sampleTransaction = {
    id: 'tx_001',
    amount: 45.75,
    type: 'expense' as const,
    category: 'Groceries',
    date: new Date(),
    description: 'Weekly grocery shopping'
  }

  it('displays transaction information', () => {
    render(<TransactionCard transaction={sampleTransaction} />)
    
    expect(screen.getByText('$45.75')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(
      <TransactionCard 
        transaction={sampleTransaction} 
        onEdit={onEdit} 
      />
    )
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith('1')
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test TransactionCard.test.tsx
```

## 📚 Documentation

### Code Documentation

- **Add JSDoc comments** for functions and components
- **Document complex logic**
- **Include usage examples**
- **Keep comments up to date**

```typescript
/**
 * Calculates the total spending for a specific category within a date range
 * 
 * @param transactions - Array of transactions to analyze
 * @param categoryId - ID of the category to filter by
 * @param startDate - Start date for the calculation
 * @param endDate - End date for the calculation
 * @returns Total amount spent in the category
 * 
 * @example
 * ```typescript
 * const total = calculateCategorySpending(
 *   transactions, 
 *   'food-category-id', 
 *   new Date('2024-01-01'), 
 *   new Date('2024-01-31')
 * )
 * ```
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categoryId: string,
  startDate: Date,
  endDate: Date
): number {
  // Implementation
}
```

### README Updates

When adding new features:

1. **Update the features list**
2. **Add screenshots** if UI changes
3. **Update installation instructions** if needed
4. **Add configuration options**

## 🏆 Recognition

### Contributors Hall of Fame

We recognize our contributors in multiple ways:

- **GitHub Contributors** section
- **Changelog mentions** for significant contributions
- **LinkedIn recommendations** (with permission)
- **Special badges** for different contribution types

### Contribution Types

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation**
- 🎨 **Design**
- 🧪 **Testing**
- 🔧 **Infrastructure**
- 🌍 **Translation**
- 💡 **Ideas & Planning**

## 💬 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code review and collaboration
- **Email**: [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com) for sensitive issues

### Getting Help

- **Read the documentation** first
- **Search existing issues** and discussions
- **Ask specific questions** with context
- **Be patient and respectful**

### Community Guidelines

- **Be helpful** to newcomers
- **Share knowledge** and resources
- **Celebrate others' contributions**
- **Provide constructive feedback**
- **Stay on topic** in discussions

## 🎯 Good First Issues

New to the project? Look for issues labeled:

- `good first issue` - Perfect for beginners
- `help wanted` - We need community help
- `documentation` - Improve our docs
- `bug` - Fix reported issues

## 📊 Project Stats

<div align="center">

![GitHub Activity](https://img.shields.io/github/commit-activity/m/Xenonesis/Budget-Tracker-?style=for-the-badge)
![GitHub Last Commit](https://img.shields.io/github/last-commit/Xenonesis/Budget-Tracker-?style=for-the-badge)
![GitHub Issues](https://img.shields.io/github/issues/Xenonesis/Budget-Tracker-?style=for-the-badge)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Xenonesis/Budget-Tracker-?style=for-the-badge)

</div>

## 📄 License

By contributing to Budget Buddy, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

<div align="center">

**Thank you for contributing to Budget Buddy! 🙏**

*Together, we're building the future of financial management.*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/Xenonesis/Budget-Tracker-)

</div> 