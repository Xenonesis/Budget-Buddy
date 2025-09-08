// Enhanced analytics types for Budget Buddy
export interface YearlyAnalytics {
  year: number;
  monthlyData: MonthlyAnalytics[];
  totalSpending: number;
  totalIncome: number;
  netIncome: number;
  averageMonthlySpending: number;
  averageMonthlyIncome: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown;
  quarterlyData: QuarterlyData[];
  topCategories: CategorySummary[];
  spendingTrends: TrendAnalysis;
  budgetPerformance?: BudgetPerformance;
}

export interface MonthlyAnalytics {
  month: string;
  monthNumber: number;
  year: number;
  totalSpending: number;
  totalIncome: number;
  netIncome: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown;
  averageDailySpending: number;
  budgetUtilization?: number;
  topExpenseCategory?: string;
  topIncomeSource?: string;
  weeklyBreakdown?: WeeklyData[];
}

export interface QuarterlyData {
  quarter: number;
  year: number;
  period: string; // e.g., "Q1 2024"
  totalSpending: number;
  totalIncome: number;
  netIncome: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown;
  monthsIncluded: string[];
}

export interface WeeklyData {
  week: number;
  startDate: string;
  endDate: string;
  totalSpending: number;
  totalIncome: number;
  transactionCount: number;
  averageDailySpending: number;
}

export interface CategoryBreakdown {
  [categoryName: string]: CategoryData;
}

export interface CategoryData {
  amount: number;
  percentage: number;
  transactionCount: number;
  averageTransactionAmount: number;
  trend?: number; // Growth percentage
  rank?: number; // Rank by spending amount
}

export interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageAmount: number;
  icon?: string;
  color?: string;
}

export interface TrendAnalysis {
  monthlyGrowth: number; // Month-over-month growth
  quarterlyGrowth: number; // Quarter-over-quarter growth
  yearlyGrowth: number; // Year-over-year growth
  direction: 'increasing' | 'decreasing' | 'stable';
  volatility: 'low' | 'medium' | 'high';
  seasonality: SeasonalPattern[];
}

export interface SeasonalPattern {
  month: string;
  monthNumber: number;
  typicalSpending: number;
  variance: number;
  description: string;
}

export interface BudgetPerformance {
  totalBudget: number;
  totalSpent: number;
  utilizationPercentage: number;
  categoriesOverBudget: string[];
  categoriesUnderBudget: string[];
  projectedEndOfMonthStatus: 'over' | 'under' | 'on-track';
}

// Year-over-Year comparison interfaces
export interface YearOverYearComparison {
  currentYear: YearlyAnalytics;
  previousYear: YearlyAnalytics;
  comparisonYear?: number;
  metrics: YoYMetrics;
  insights: YoYInsights;
  forecasting: YoYForecasting;
}

export interface YoYMetrics {
  spendingGrowth: number;
  incomeGrowth: number;
  netIncomeGrowth: number;
  transactionGrowth: number;
  categoryGrowth: { [category: string]: number };
  monthlyComparison: MonthlyComparison[];
  quarterlyComparison: QuarterlyComparison[];
  averageTransactionSizeGrowth: number;
  savingsRateChange: number;
}

export interface MonthlyComparison {
  month: string;
  monthNumber: number;
  currentYear: MonthlyMetrics;
  previousYear: MonthlyMetrics;
  growth: GrowthMetrics;
}

export interface QuarterlyComparison {
  quarter: number;
  period: string;
  currentYear: QuarterlyMetrics;
  previousYear: QuarterlyMetrics;
  growth: GrowthMetrics;
}

export interface MonthlyMetrics {
  spending: number;
  income: number;
  netIncome: number;
  transactions: number;
  topCategory: string;
}

export interface QuarterlyMetrics {
  spending: number;
  income: number;
  netIncome: number;
  transactions: number;
  monthlyAverage: number;
}

export interface GrowthMetrics {
  spendingGrowth: number;
  incomeGrowth: number;
  netIncomeGrowth: number;
  transactionGrowth: number;
  percentage: number;
}

export interface YoYInsights {
  trends: InsightItem[];
  alerts: InsightItem[];
  recommendations: InsightItem[];
  achievements: InsightItem[];
}

export interface InsightItem {
  type: 'trend' | 'alert' | 'recommendation' | 'achievement';
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  value?: number;
  change?: number;
  actionable: boolean;
}

export interface YoYForecasting {
  nextMonth: ForecastData;
  nextQuarter: ForecastData;
  endOfYear: ForecastData;
  confidence: number;
  factors: string[];
}

export interface ForecastData {
  predictedSpending: number;
  predictedIncome: number;
  predictedNetIncome: number;
  confidence: number;
  range: {
    low: number;
    high: number;
  };
}

// Chart and visualization types
export interface ChartDataPoint {
  period: string;
  year: number;
  month?: string;
  quarter?: number;
  totalSpending: number;
  totalIncome: number;
  netIncome: number;
  transactionCount: number;
  categoryBreakdown?: CategoryBreakdown;
  [categoryName: string]: any; // Dynamic category values
}

export interface YoYChartConfig {
  viewMode: 'monthly' | 'quarterly' | 'annual';
  chartType: 'bar' | 'line' | 'area' | 'composed';
  selectedMetric: 'spending' | 'income' | 'netIncome' | 'transactions';
  selectedCategories: string[];
  showPredictive: boolean;
  timeRange: {
    startYear: number;
    endYear: number;
  };
}

export interface TooltipData {
  label: string;
  period: string;
  year: number;
  data: {
    metric: string;
    value: number;
    formattedValue: string;
    color: string;
    growth?: number;
  }[];
  comparison?: {
    previousPeriod: string;
    growth: number;
    direction: 'up' | 'down' | 'stable';
  };
}

// Filter and aggregation types
export interface AnalyticsFilters {
  years: number[];
  categories: string[];
  transactionTypes: ('income' | 'expense')[];
  amountRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AggregationOptions {
  groupBy: 'month' | 'quarter' | 'year' | 'category';
  aggregateFunction: 'sum' | 'average' | 'count' | 'median';
  includeSubcategories: boolean;
  includeBudgetComparison: boolean;
  includeForecasting: boolean;
}

// Enhanced dashboard widget types
export interface AnalyticsWidget {
  id: string;
  type: 'yoy-comparison' | 'trend-analysis' | 'category-breakdown' | 'forecasting' | 'insights';
  title: string;
  config: YoYChartConfig;
  data: any;
  lastUpdated: string;
  refreshInterval: number;
  isLoading: boolean;
  error?: string;
}

export interface DashboardLayout {
  widgets: AnalyticsWidget[];
  layout: {
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  preferences: {
    autoRefresh: boolean;
    refreshInterval: number;
    defaultTimeRange: number;
    defaultViewMode: 'monthly' | 'quarterly' | 'annual';
  };
}