# Changelog

All notable changes to the Budget Tracker app will be documented in this file.

## [7.2.0] - 2024-04-05

### Fixed
- Dark mode text visibility issues in Financial Snapshot and Income vs Expense Trend charts
- Compatibility issues with Next.js (downgraded from 15.2.4 to 14.2.1) and React (downgraded from 19.1.0 to 18.2.0)
- Reference error in savings rate calculation where undefined variable was being used
- Currency formatting to handle NaN and undefined values properly
- Transaction summary calculation to handle null/undefined transactions

### Improved
- Enhanced chart readability with proper text contrast in dark mode
- More robust error handling for edge cases in calculations
- Added validation for empty or invalid transaction data
- Added explicit `text-foreground` classes to category labels for proper dark mode visibility
- Optimized monthly data processing for more accurate financial trends display
- Improved type checking in Pie chart components

## [7.1.0] - 2024-04-03

### Fixed
- Type error in settings page involving missing fields in profile updates
- Build failure caused by incorrect argument types
- Timezone and gender field handling issues

### Improved
- Form data consistency in the settings page
- Error handling and logging throughout the application
- Type checking for data interfaces

## [7.0.0] - 2024-04-02

### Added
- Enhanced category management with improved deletion functionality
- Dynamic screen size detection for responsive chart layouts
- Colorful gradients in charts based on budget usage
- Category deletion capability with prominent DELETE buttons

### Improved
- Completely redesigned category deletion UI with clear instructions
- Visualization of custom categories section with prominent styling
- Date handling to ensure proper format for database constraints
- Error messages with detailed information for better troubleshooting
- Visual cues and instructions for managing categories
- Fixed transaction submission issues with improved date validation
- Enhanced error handling with detailed console logging
- Data validation before submission to database
- Fixed constraint violations with proper data formatting
- Added robust error recovery mechanisms

## [6.0.0] - 2024-03-31

### Added
- Enhanced budget visualization with multiple chart types (bar, pie, radial)
- Interactive chart type selectors for better data exploration
- Detailed tooltips for all charts with contextual information
- Percentage indicators directly on charts for quick insights
- Gender selection option in user profile settings
- Timezone selection for better personalization of reports and notifications

### Improved
- Redesigned BudgetCharts component with better UI/UX
- Enhanced Income vs. Expenses charts with area, bar, and line chart combinations
- Added gradient fills and modern design elements to all visualizations
- Improved empty states with helpful messages
- Better color contrast and accessibility for data visualization
- Improved budget creation with multiple access points on mobile
- Enhanced button sizes for better touch interactions
- Optimized chart rendering with useMemo hooks
- Improved data processing for more accurate visualization
- Enhanced responsive design for all chart components
- Better color palette implementation with consistent styling

## [5.0.0] - 2024-03-30

### Added
- Notification preferences for budget alerts and transaction confirmations
- Timezone selection in user profile settings
- Enhanced transaction categories with custom user-defined categories
- Phone number verification for account security
- Improved recurring transactions with customizable schedules and more options

### Improved
- Redesigned dashboard with more intuitive navigation
- Optimized mobile experience with better touch controls
- Added keyboard shortcuts for common actions
- Improved accessibility throughout the application
- Enhanced error handling with more informative messages
- Updated Next.js to version 14.2.26
- Improved database performance with optimized queries
- Enhanced security with additional validation checks
- Reduced bundle size for faster loading times
- Added comprehensive error logging

## [4.0.0] - 2023-03-30

### Added
- Enhanced transaction filtering and sorting capabilities
- PDF, CSV, and Excel export functionality for transactions
- Scheduled exports with multiple frequency options
- Improved transaction form with autosave and suggestions
- Theme toggle functionality for easy switching between light, dark, and system themes

### Improved
- Fixed dropdown duplication issues in custom category forms
- Added virtual scrolling for better performance with large transaction lists
- Improved timezone handling across all date operations
- Enhanced mobile responsiveness throughout the application
- Added accessible theme toggles to all key pages (landing, dashboard, profile)
- Resolved transaction creation failures with reliable insertion function
- Fixed currency display issues in dark mode
- Corrected recurring transaction generation logic
- Improved state management with better error handling 