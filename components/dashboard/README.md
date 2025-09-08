# Enhanced Dashboard Components

A comprehensive set of interactive dashboard components for expense tracking and analysis with advanced drill-down capabilities and year-over-year comparisons.

## Features

### 🥧 Enhanced Expense Pie Chart
- **Interactive drill-down**: Click on pie slices to view subcategories
- **Smart grouping**: Automatically groups small categories into "Other"
- **Rich tooltips**: Shows amounts, percentages, and subcategory counts
- **Smooth animations**: Animated transitions during drill-down
- **Breadcrumb navigation**: Easy navigation back to main view

### 📈 Monthly Spending Trend
- **Year-over-year comparison**: Toggle between previous year and average comparisons
- **Interactive data points**: Click on points for detailed monthly breakdown
- **Category overlays**: Show/hide individual category trends
- **Multiple comparison modes**: None, Previous Year, Monthly Average
- **Zoom functionality**: Brush control for detailed time range analysis
- **Enhanced tooltips**: YoY growth percentages and category breakdowns

### 📊 Year-over-Year Comparison
- **Multiple view modes**: Monthly, Quarterly, and Annual views
- **Chart type switching**: Toggle between bar and line charts
- **Category-specific analysis**: Compare individual categories across years
- **Growth indicators**: Visual trend indicators and percentage changes
- **Interactive drill-down**: Click on data points to explore specific periods

### 🎛️ Enhanced Dashboard
- **Unified interface**: All charts integrated with consistent navigation
- **Global filtering**: Date range selection affects all charts
- **Drill-down breadcrumbs**: Track your navigation path
- **Summary statistics**: Key metrics at a glance
- **Export functionality**: Built-in data export capabilities

## Usage

### Basic Usage

```tsx
import { EnhancedDashboard } from './components/dashboard';

function MyApp() {
  const expenses = [
    {
      id: "1",
      amount: 1200,
      category: "Housing",
      subcategory: "Rent",
      date: new Date("2024-01-15"),
      description: "Monthly rent payment"
    },
    // ... more expenses
  ];

  return (
    <EnhancedDashboard
      expenses={expenses}
      onExport={() => console.log('Export clicked')}
      onRefresh={() => console.log('Refresh clicked')}
    />
  );
}
```

### Individual Components

```tsx
import { 
  EnhancedExpensePieChart, 
  MonthlySpendingTrend, 
  YearOverYearComparison 
} from './components/dashboard';

// Pie Chart with drill-down
<EnhancedExpensePieChart
  categoryData={categoryData}
  onCategoryClick={(category) => console.log('Category clicked:', category)}
/>

// Trend Chart with YoY comparison
<MonthlySpendingTrend
  data={monthlyData}
  selectedCategories={['Food', 'Transportation']}
  onCategoryToggle={(category) => toggleCategory(category)}
  showYearOverYear={true}
  onMonthClick={(month, year) => console.log('Month clicked:', month, year)}
/>

// Year-over-Year Analysis
<YearOverYearComparison
  yearlyData={yearlyData}
  onYearClick={(year) => console.log('Year clicked:', year)}
/>
```

## Data Types

```tsx
interface ExpenseData {
  id: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: Date;
  description: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  subcategories?: { name: string; value: number; color: string; }[];
}

interface MonthlyTrendData {
  month: string;
  year: number;
  totalSpending: number;
  categoryBreakdown: { [category: string]: number };
  transactionCount: number;
}

interface YearlyData {
  year: number;
  monthlyData: MonthlyTrendData[];
  totalSpending: number;
  averageMonthlySpending: number;
}
```

## Interactive Features

### Drill-Down Navigation
1. **Pie Chart**: Click slices → View subcategories → Use back button to return
2. **Trend Chart**: Click data points → View monthly details
3. **YoY Chart**: Click bars/points → Explore specific years
4. **Breadcrumbs**: Always visible navigation path

### Comparison Modes
- **None**: Standard view without comparisons
- **Previous Year**: Overlay previous year data for YoY analysis
- **Monthly Average**: Compare against historical monthly averages

### Time Range Controls
- **1 Month**: Last 30 days
- **3 Months**: Last quarter
- **6 Months**: Last half year
- **1 Year**: Last 12 months
- **All Time**: Complete history

## Customization

### Colors
Charts use a consistent color palette that can be customized by modifying the `COLORS` arrays in each component.

### Tooltips
All tooltips are fully customizable through the `CustomTooltip` components in each chart.

### Animations
Smooth transitions and animations can be adjusted by modifying the CSS transition properties and timeout values.

## Dependencies

- React 18+
- Recharts 2.x
- Lucide React (for icons)
- Your UI component library (Card, Button, Select, etc.)

## Performance

- **Memoized components**: All charts use React.memo for optimal re-rendering
- **Efficient data processing**: Data transformations are memoized with useMemo
- **Lazy loading**: Large datasets are processed incrementally
- **Responsive design**: Charts adapt to container sizes automatically

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+