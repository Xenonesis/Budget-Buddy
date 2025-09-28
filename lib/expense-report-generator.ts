/**
 * Expense Report Generator - Auto-generate comprehensive expense reports
 * Works with batch processing for instant expense reports from multiple receipts
 */

import { ExtractedTransactionData } from './ocr-processor';

interface ExpenseReportConfig {
  includeCharts: boolean;
  includeTaxBreakdown: boolean;
  includeReceiptImages: boolean;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template: 'business' | 'personal' | 'tax' | 'travel';
  currency: string;
  locale: string;
}

interface ExpenseReport {
  reportId: string;
  title: string;
  dateRange: [Date, Date];
  generatedAt: Date;
  totalAmount: number;
  transactionCount: number;
  currency: string;
  
  // Breakdowns
  categoryBreakdown: CategoryBreakdown[];
  merchantSummary: MerchantSummary[];
  dailySummary: DailySummary[];
  weeklySummary: WeeklySummary[];
  monthlySummary: MonthlySummary[];
  
  // Analysis
  insights: ReportInsight[];
  taxInformation: TaxInformation;
  complianceInfo: ComplianceInfo;
  
  // Metadata
  metadata: ReportMetadata;
  transactions: ExtractedTransactionData[];
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  averageTransaction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}

interface MerchantSummary {
  merchant: string;
  amount: number;
  count: number;
  category: string;
  averageTransaction: number;
  firstTransaction: Date;
  lastTransaction: Date;
  loyalty: 'high' | 'medium' | 'low';
}

interface DailySummary {
  date: string;
  amount: number;
  count: number;
  topCategory: string;
  topMerchant: string;
  dayOfWeek: string;
}

interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  amount: number;
  count: number;
  averageDaily: number;
  topCategory: string;
  growth: number;
}

interface MonthlySummary {
  month: string;
  year: number;
  amount: number;
  count: number;
  averageDaily: number;
  topCategory: string;
  budgetAdherence?: number;
}

interface ReportInsight {
  type: 'spending_pattern' | 'cost_saving' | 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedSavings?: number;
  confidence: number;
}

interface TaxInformation {
  taxableAmount: number;
  taxExemptAmount: number;
  gstTotal: number;
  gstBreakdown: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  deductibleExpenses: number;
  taxDocuments: TaxDocument[];
}

interface TaxDocument {
  transactionId: string;
  gstNumber?: string;
  taxAmount: number;
  taxRate: number;
  taxType: string;
  eligible: boolean;
}

interface ComplianceInfo {
  businessCompliant: boolean;
  taxCompliant: boolean;
  auditReady: boolean;
  missingDocuments: string[];
  recommendations: string[];
}

interface ReportMetadata {
  processingTime: number;
  accuracy: number;
  manualReviewRequired: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  sources: string[];
}

export class ExpenseReportGenerator {
  private config: ExpenseReportConfig;
  private chartGenerator: ChartGenerator;
  private taxCalculator: TaxCalculator;
  
  constructor(config?: Partial<ExpenseReportConfig>) {
    this.config = {
      includeCharts: true,
      includeTaxBreakdown: true,
      includeReceiptImages: false,
      format: 'pdf',
      template: 'business',
      currency: 'INR',
      locale: 'en-IN',
      ...config
    };
    
    this.chartGenerator = new ChartGenerator();
    this.taxCalculator = new TaxCalculator();
  }

  /**
   * Generate comprehensive expense report
   */
  async generateReport(
    transactions: ExtractedTransactionData[],
    options?: {
      title?: string;
      dateRange?: [Date, Date];
      budgets?: Map<string, number>;
      previousPeriodData?: ExtractedTransactionData[];
    }
  ): Promise<ExpenseReport> {
    const startTime = Date.now();
    
    if (transactions.length === 0) {
      throw new Error('No transactions provided for report generation');
    }
    
    // Sort transactions by date
    const sortedTransactions = this.sortTransactionsByDate(transactions);
    
    // Calculate date range
    const dateRange = options?.dateRange || this.calculateDateRange(sortedTransactions);
    
    // Generate breakdowns
    const categoryBreakdown = await this.generateCategoryBreakdown(
      sortedTransactions, 
      options?.previousPeriodData
    );
    
    const merchantSummary = await this.generateMerchantSummary(sortedTransactions);
    const dailySummary = await this.generateDailySummary(sortedTransactions);
    const weeklySummary = await this.generateWeeklySummary(sortedTransactions);
    const monthlySummary = await this.generateMonthlySummary(sortedTransactions);
    
    // Generate insights
    const insights = await this.generateReportInsights(
      sortedTransactions,
      categoryBreakdown,
      merchantSummary,
      options?.budgets
    );
    
    // Calculate tax information
    const taxInformation = await this.taxCalculator.calculateTaxInformation(sortedTransactions);
    
    // Generate compliance info
    const complianceInfo = await this.generateComplianceInfo(sortedTransactions, taxInformation);
    
    // Calculate totals
    const totalAmount = this.calculateTotalAmount(sortedTransactions);
    
    const processingTime = Date.now() - startTime;
    
    return {
      reportId: this.generateReportId(),
      title: options?.title || `Expense Report - ${this.formatDateRange(dateRange)}`,
      dateRange,
      generatedAt: new Date(),
      totalAmount,
      transactionCount: sortedTransactions.length,
      currency: this.config.currency,
      
      categoryBreakdown,
      merchantSummary,
      dailySummary,
      weeklySummary,
      monthlySummary,
      
      insights,
      taxInformation,
      complianceInfo,
      
      metadata: {
        processingTime,
        accuracy: this.calculateReportAccuracy(sortedTransactions),
        manualReviewRequired: this.countManualReviewRequired(sortedTransactions),
        dataQuality: this.assessDataQuality(sortedTransactions),
        sources: this.extractDataSources(sortedTransactions)
      },
      
      transactions: sortedTransactions
    };
  }

  /**
   * Generate category breakdown with trends
   */
  private async generateCategoryBreakdown(
    transactions: ExtractedTransactionData[],
    previousPeriodData?: ExtractedTransactionData[]
  ): Promise<CategoryBreakdown[]> {
    const categoryTotals = new Map<string, { amount: number; count: number; transactions: ExtractedTransactionData[] }>();
    
    // Group by category
    for (const transaction of transactions) {
      const category = transaction.category || 'Uncategorized';
      const amount = transaction.amount || 0;
      
      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, { amount: 0, count: 0, transactions: [] });
      }
      
      const categoryData = categoryTotals.get(category)!;
      categoryData.amount += amount;
      categoryData.count += 1;
      categoryData.transactions.push(transaction);
    }
    
    const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0);
    
    const breakdown: CategoryBreakdown[] = [];
    
    for (const [category, data] of categoryTotals) {
      const percentage = (data.amount / totalAmount) * 100;
      const averageTransaction = data.amount / data.count;
      
      // Calculate trend if previous period data is available
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let trendPercentage = 0;
      
      if (previousPeriodData) {
        const previousAmount = this.calculateCategoryAmountInPeriod(category, previousPeriodData);
        if (previousAmount > 0) {
          trendPercentage = ((data.amount - previousAmount) / previousAmount) * 100;
          if (trendPercentage > 10) trend = 'increasing';
          else if (trendPercentage < -10) trend = 'decreasing';
        }
      }
      
      breakdown.push({
        category,
        amount: data.amount,
        count: data.count,
        percentage,
        averageTransaction,
        trend,
        trendPercentage
      });
    }
    
    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Generate merchant summary
   */
  private async generateMerchantSummary(transactions: ExtractedTransactionData[]): Promise<MerchantSummary[]> {
    const merchantTotals = new Map<string, {
      amount: number;
      count: number;
      category: string;
      transactions: ExtractedTransactionData[];
    }>();
    
    for (const transaction of transactions) {
      const merchant = transaction.merchant || 'Unknown';
      const amount = transaction.amount || 0;
      const category = transaction.category || 'Uncategorized';
      
      if (!merchantTotals.has(merchant)) {
        merchantTotals.set(merchant, { amount: 0, count: 0, category, transactions: [] });
      }
      
      const merchantData = merchantTotals.get(merchant)!;
      merchantData.amount += amount;
      merchantData.count += 1;
      merchantData.transactions.push(transaction);
    }
    
    const summary: MerchantSummary[] = [];
    
    for (const [merchant, data] of merchantTotals) {
      const sortedTransactions = data.transactions.sort((a, b) => 
        new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
      );
      
      const firstTransaction = new Date(sortedTransactions[0].date || '');
      const lastTransaction = new Date(sortedTransactions[sortedTransactions.length - 1].date || '');
      const averageTransaction = data.amount / data.count;
      
      // Determine loyalty level based on frequency and recency
      let loyalty: 'high' | 'medium' | 'low' = 'low';
      if (data.count >= 10) loyalty = 'high';
      else if (data.count >= 5) loyalty = 'medium';
      
      summary.push({
        merchant,
        amount: data.amount,
        count: data.count,
        category: data.category,
        averageTransaction,
        firstTransaction,
        lastTransaction,
        loyalty
      });
    }
    
    return summary.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Generate daily summary
   */
  private async generateDailySummary(transactions: ExtractedTransactionData[]): Promise<DailySummary[]> {
    const dailyTotals = new Map<string, {
      amount: number;
      count: number;
      categories: Map<string, number>;
      merchants: Map<string, number>;
    }>();
    
    for (const transaction of transactions) {
      const date = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : 'Unknown';
      const amount = transaction.amount || 0;
      const category = transaction.category || 'Uncategorized';
      const merchant = transaction.merchant || 'Unknown';
      
      if (!dailyTotals.has(date)) {
        dailyTotals.set(date, {
          amount: 0,
          count: 0,
          categories: new Map(),
          merchants: new Map()
        });
      }
      
      const dayData = dailyTotals.get(date)!;
      dayData.amount += amount;
      dayData.count += 1;
      
      dayData.categories.set(category, (dayData.categories.get(category) || 0) + amount);
      dayData.merchants.set(merchant, (dayData.merchants.get(merchant) || 0) + amount);
    }
    
    const summary: DailySummary[] = [];
    
    for (const [date, data] of dailyTotals) {
      const topCategory = this.getTopEntry(data.categories);
      const topMerchant = this.getTopEntry(data.merchants);
      const dayOfWeek = date !== 'Unknown' ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown';
      
      summary.push({
        date,
        amount: data.amount,
        count: data.count,
        topCategory,
        topMerchant,
        dayOfWeek
      });
    }
    
    return summary.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Generate weekly summary
   */
  private async generateWeeklySummary(transactions: ExtractedTransactionData[]): Promise<WeeklySummary[]> {
    const weeklyTotals = new Map<string, {
      amount: number;
      count: number;
      categories: Map<string, number>;
      weekStart: Date;
      weekEnd: Date;
    }>();
    
    for (const transaction of transactions) {
      if (!transaction.date) continue;
      
      const date = new Date(transaction.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      
      const weekKey = weekStart.toISOString().split('T')[0];
      const amount = transaction.amount || 0;
      const category = transaction.category || 'Uncategorized';
      
      if (!weeklyTotals.has(weekKey)) {
        weeklyTotals.set(weekKey, {
          amount: 0,
          count: 0,
          categories: new Map(),
          weekStart: new Date(weekStart),
          weekEnd: new Date(weekEnd)
        });
      }
      
      const weekData = weeklyTotals.get(weekKey)!;
      weekData.amount += amount;
      weekData.count += 1;
      weekData.categories.set(category, (weekData.categories.get(category) || 0) + amount);
    }
    
    const summary: WeeklySummary[] = [];
    const sortedWeeks = Array.from(weeklyTotals.entries()).sort((a, b) => 
      a[1].weekStart.getTime() - b[1].weekStart.getTime()
    );
    
    for (let i = 0; i < sortedWeeks.length; i++) {
      const [weekKey, data] = sortedWeeks[i];
      const averageDaily = data.amount / 7;
      const topCategory = this.getTopEntry(data.categories);
      
      // Calculate growth compared to previous week
      let growth = 0;
      if (i > 0) {
        const previousWeekAmount = sortedWeeks[i - 1][1].amount;
        growth = previousWeekAmount > 0 ? ((data.amount - previousWeekAmount) / previousWeekAmount) * 100 : 0;
      }
      
      summary.push({
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        amount: data.amount,
        count: data.count,
        averageDaily,
        topCategory,
        growth
      });
    }
    
    return summary;
  }

  /**
   * Generate monthly summary
   */
  private async generateMonthlySummary(transactions: ExtractedTransactionData[]): Promise<MonthlySummary[]> {
    const monthlyTotals = new Map<string, {
      amount: number;
      count: number;
      categories: Map<string, number>;
      year: number;
      month: string;
      daysInMonth: number;
    }>();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    for (const transaction of transactions) {
      if (!transaction.date) continue;
      
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];
      const monthKey = `${year}-${monthIndex}`;
      const amount = transaction.amount || 0;
      const category = transaction.category || 'Uncategorized';
      
      if (!monthlyTotals.has(monthKey)) {
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        monthlyTotals.set(monthKey, {
          amount: 0,
          count: 0,
          categories: new Map(),
          year,
          month: monthName,
          daysInMonth
        });
      }
      
      const monthData = monthlyTotals.get(monthKey)!;
      monthData.amount += amount;
      monthData.count += 1;
      monthData.categories.set(category, (monthData.categories.get(category) || 0) + amount);
    }
    
    const summary: MonthlySummary[] = [];
    
    for (const [monthKey, data] of monthlyTotals) {
      const averageDaily = data.amount / data.daysInMonth;
      const topCategory = this.getTopEntry(data.categories);
      
      summary.push({
        month: data.month,
        year: data.year,
        amount: data.amount,
        count: data.count,
        averageDaily,
        topCategory
      });
    }
    
    return summary.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });
  }

  /**
   * Generate report insights
   */
  private async generateReportInsights(
    transactions: ExtractedTransactionData[],
    categoryBreakdown: CategoryBreakdown[],
    merchantSummary: MerchantSummary[],
    budgets?: Map<string, number>
  ): Promise<ReportInsight[]> {
    const insights: ReportInsight[] = [];
    
    // Top spending insights
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      insights.push({
        type: 'spending_pattern',
        title: `Highest Spending Category: ${topCategory.category}`,
        description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of total expenses (₹${topCategory.amount.toLocaleString()})`,
        impact: 'high',
        actionable: true,
        confidence: 0.95
      });
    }
    
    // Merchant loyalty insights
    const highLoyaltyMerchants = merchantSummary.filter(m => m.loyalty === 'high');
    if (highLoyaltyMerchants.length > 0) {
      const totalLoyaltySpending = highLoyaltyMerchants.reduce((sum, m) => sum + m.amount, 0);
      insights.push({
        type: 'cost_saving',
        title: 'Loyalty Program Opportunities',
        description: `You frequently shop at ${highLoyaltyMerchants.length} merchants (₹${totalLoyaltySpending.toLocaleString()} total). Check for loyalty programs.`,
        impact: 'medium',
        actionable: true,
        estimatedSavings: totalLoyaltySpending * 0.05, // Assume 5% savings
        confidence: 0.8
      });
    }
    
    // Trend insights
    const increasingCategories = categoryBreakdown.filter(c => c.trend === 'increasing');
    if (increasingCategories.length > 0) {
      const totalIncrease = increasingCategories.reduce((sum, c) => sum + c.amount, 0);
      insights.push({
        type: 'trend',
        title: 'Increasing Spending Categories',
        description: `${increasingCategories.length} categories show increasing spending trends (₹${totalIncrease.toLocaleString()})`,
        impact: 'medium',
        actionable: true,
        confidence: 0.85
      });
    }
    
    // Budget insights
    if (budgets) {
      for (const [category, budget] of budgets) {
        const categoryData = categoryBreakdown.find(c => c.category === category);
        if (categoryData && categoryData.amount > budget) {
          const overage = categoryData.amount - budget;
          insights.push({
            type: 'anomaly',
            title: `Budget Exceeded: ${category}`,
            description: `${category} spending (₹${categoryData.amount.toLocaleString()}) exceeded budget by ₹${overage.toLocaleString()}`,
            impact: 'high',
            actionable: true,
            confidence: 1.0
          });
        }
      }
    }
    
    return insights.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return impactWeight[b.impact] - impactWeight[a.impact];
    });
  }

  // Helper methods
  private sortTransactionsByDate(transactions: ExtractedTransactionData[]): ExtractedTransactionData[] {
    return transactions.sort((a, b) => {
      const dateA = new Date(a.date || '').getTime();
      const dateB = new Date(b.date || '').getTime();
      return dateA - dateB;
    });
  }

  private calculateDateRange(transactions: ExtractedTransactionData[]): [Date, Date] {
    if (transactions.length === 0) {
      const now = new Date();
      return [now, now];
    }
    
    const sortedTransactions = this.sortTransactionsByDate(transactions);
    const startDate = new Date(sortedTransactions[0].date || '');
    const endDate = new Date(sortedTransactions[sortedTransactions.length - 1].date || '');
    
    return [startDate, endDate];
  }

  private calculateTotalAmount(transactions: ExtractedTransactionData[]): number {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  private calculateCategoryAmountInPeriod(category: string, transactions: ExtractedTransactionData[]): number {
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  private getTopEntry(map: Map<string, number>): string {
    let topEntry = '';
    let maxValue = 0;
    
    for (const [key, value] of map) {
      if (value > maxValue) {
        maxValue = value;
        topEntry = key;
      }
    }
    
    return topEntry;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDateRange(dateRange: [Date, Date]): string {
    const start = dateRange[0].toLocaleDateString();
    const end = dateRange[1].toLocaleDateString();
    return `${start} to ${end}`;
  }

  private calculateReportAccuracy(transactions: ExtractedTransactionData[]): number {
    const confidences = transactions.map(t => t.confidence || 0.8);
    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  private countManualReviewRequired(transactions: ExtractedTransactionData[]): number {
    return transactions.filter(t => (t.confidence || 0.8) < 0.7).length;
  }

  private assessDataQuality(transactions: ExtractedTransactionData[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgConfidence = this.calculateReportAccuracy(transactions);
    
    if (avgConfidence >= 0.9) return 'excellent';
    if (avgConfidence >= 0.8) return 'good';
    if (avgConfidence >= 0.7) return 'fair';
    return 'poor';
  }

  private extractDataSources(transactions: ExtractedTransactionData[]): string[] {
    const sources = new Set<string>();
    
    // Since we don't have fileName or batchId properties, 
    // we'll infer sources from available data
    for (const transaction of transactions) {
      if (transaction.confidence && transaction.confidence > 0) {
        sources.add('OCR Processing');
      }
    }
    
    if (sources.size === 0) {
      sources.add('Manual Entry');
    }
    
    return Array.from(sources);
  }

  private async generateComplianceInfo(
    transactions: ExtractedTransactionData[],
    taxInfo: TaxInformation
  ): Promise<ComplianceInfo> {
    const missingDocuments: string[] = [];
    const recommendations: string[] = [];
    
    // Check for high-value transactions without detailed categorization
    const businessTransactions = transactions.filter(t => (t.amount || 0) > 500);
    const uncategorizedTransactions = businessTransactions.filter(t => !t.category || t.category === 'Other');
    
    if (uncategorizedTransactions.length > 0) {
      missingDocuments.push(`${uncategorizedTransactions.length} high-value transactions need proper categorization`);
      recommendations.push('Categorize all business expenses above ₹500 for better tax compliance');
    }
    
    // Check for receipt retention
    const highValueTransactions = transactions.filter(t => (t.amount || 0) > 2000);
    recommendations.push(`Keep physical/digital receipts for ${highValueTransactions.length} high-value transactions`);
    
    return {
      businessCompliant: missingDocuments.length === 0,
      taxCompliant: taxInfo.gstTotal > 0,
      auditReady: missingDocuments.length < 5,
      missingDocuments,
      recommendations
    };
  }
}

// Supporting classes
class ChartGenerator {
  generateCategoryPieChart(breakdown: CategoryBreakdown[]): any {
    // Implementation for chart generation
    return {};
  }
  
  generateTrendChart(data: any[]): any {
    // Implementation for trend chart
    return {};
  }
}

class TaxCalculator {
  private isTaxableCategory(category: string): boolean {
    const taxableCategories = [
      'Food & Dining',
      'Shopping',
      'Entertainment',
      'Travel',
      'Business',
      'Services',
      'Technology',
      'Education',
      'Healthcare'
    ];
    return taxableCategories.includes(category);
  }

  async calculateTaxInformation(transactions: ExtractedTransactionData[]): Promise<TaxInformation> {
    let gstTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    const taxDocuments: TaxDocument[] = [];
    
    for (const transaction of transactions) {
      // Since tax information is not available in ExtractedTransactionData,
      // we'll estimate tax based on transaction amount and category
      const amount = transaction.amount || 0;
      
      if (amount > 0 && transaction.category && this.isTaxableCategory(transaction.category)) {
        // Estimate 18% GST for taxable categories
        const estimatedGST = amount * 0.18;
        gstTotal += estimatedGST;
        cgst += estimatedGST * 0.5; // Split CGST/SGST
        sgst += estimatedGST * 0.5;
        
        taxDocuments.push({
          transactionId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          gstNumber: undefined,
          taxAmount: estimatedGST,
          taxRate: 18,
          taxType: 'Estimated GST',
          eligible: true
        });
      }
    }
    
    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const taxableAmount = totalAmount - gstTotal;
    
    return {
      taxableAmount,
      taxExemptAmount: 0,
      gstTotal,
      gstBreakdown: { cgst, sgst, igst },
      deductibleExpenses: taxableAmount,
      taxDocuments
    };
  }
}

export default ExpenseReportGenerator;