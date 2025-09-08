// Year-over-Year Testing and Validation Utilities
// This utility helps validate the Year-over-Year functionality and data integrity

import { YearOverYearService } from './year-over-year-service';
import { PredictiveAnalyticsService } from './predictive-analytics-service';
import { supabase } from './supabase';

export interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

export class YearOverYearValidator {
  /**
   * Run comprehensive validation tests for Year-over-Year functionality
   */
  static async runValidationSuite(userId: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test 1: Basic data fetching
      results.push(await this.testDataFetching(userId));

      // Test 2: Data structure validation
      results.push(await this.testDataStructure(userId));

      // Test 3: Category data integrity
      results.push(await this.testCategoryIntegrity(userId));

      // Test 4: Year-over-year metrics calculation
      results.push(await this.testMetricsCalculation(userId));

      // Test 5: Predictive analytics integration
      results.push(await this.testPredictiveAnalytics(userId));

      // Test 6: Edge cases handling
      results.push(await this.testEdgeCases(userId));

      // Test 7: Performance validation
      results.push(await this.testPerformance(userId));

    } catch (error) {
      results.push({
        test: 'Global Error Handler',
        passed: false,
        message: `Validation suite failed: ${error}`,
        data: { error }
      });
    }

    return results;
  }

  /**
   * Test basic data fetching functionality
   */
  private static async testDataFetching(userId: string): Promise<ValidationResult> {
    try {
      const startTime = Date.now();
      const data = await YearOverYearService.fetchYearOverYearData(userId);
      const duration = Date.now() - startTime;

      if (!Array.isArray(data)) {
        return {
          test: 'Data Fetching',
          passed: false,
          message: 'Data fetching returned non-array result',
          data: { result: data, duration }
        };
      }

      return {
        test: 'Data Fetching',
        passed: true,
        message: `Successfully fetched ${data.length} years of data in ${duration}ms`,
        data: { yearsCount: data.length, duration }
      };

    } catch (error) {
      return {
        test: 'Data Fetching',
        passed: false,
        message: `Data fetching failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Test data structure integrity
   */
  private static async testDataStructure(userId: string): Promise<ValidationResult> {
    try {
      const data = await YearOverYearService.fetchYearOverYearData(userId);
      
      if (data.length === 0) {
        return {
          test: 'Data Structure',
          passed: true,
          message: 'No data available - structure validation skipped',
          data: { isEmpty: true }
        };
      }

      const firstYear = data[0];
      const requiredFields = [
        'year', 'monthlyData', 'totalSpending', 'totalIncome', 'netIncome',
        'averageMonthlySpending', 'averageMonthlyIncome', 'transactionCount',
        'categoryBreakdown', 'quarterlyData', 'topCategories', 'spendingTrends'
      ];

      const missingFields = requiredFields.filter(field => !(field in firstYear));
      
      if (missingFields.length > 0) {
        return {
          test: 'Data Structure',
          passed: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          data: { missingFields, actualFields: Object.keys(firstYear) }
        };
      }

      // Validate monthly data structure
      if (firstYear.monthlyData.length > 0) {
        const monthRequiredFields = [
          'month', 'monthNumber', 'year', 'totalSpending', 'totalIncome',
          'netIncome', 'transactionCount', 'categoryBreakdown', 'averageDailySpending'
        ];
        
        const monthMissingFields = monthRequiredFields.filter(field => 
          !(field in firstYear.monthlyData[0])
        );

        if (monthMissingFields.length > 0) {
          return {
            test: 'Data Structure',
            passed: false,
            message: `Missing monthly data fields: ${monthMissingFields.join(', ')}`,
            data: { monthMissingFields }
          };
        }
      }

      return {
        test: 'Data Structure',
        passed: true,
        message: 'All required data structure fields present',
        data: { 
          fieldsValidated: requiredFields.length,
          monthlyDataCount: firstYear.monthlyData.length
        }
      };

    } catch (error) {
      return {
        test: 'Data Structure',
        passed: false,
        message: `Data structure validation failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Test category data integrity
   */
  private static async testCategoryIntegrity(userId: string): Promise<ValidationResult> {
    try {
      const data = await YearOverYearService.fetchYearOverYearData(userId);
      
      if (data.length === 0) {
        return {
          test: 'Category Integrity',
          passed: true,
          message: 'No data available - category validation skipped',
          data: { isEmpty: true }
        };
      }

      let totalCategoryIssues = 0;
      let totalCategoriesChecked = 0;

      data.forEach(yearData => {
        Object.entries(yearData.categoryBreakdown).forEach(([categoryName, categoryData]) => {
          totalCategoriesChecked++;

          // Check CategoryData structure
          const requiredCategoryFields = ['amount', 'percentage', 'transactionCount', 'averageTransactionAmount'];
          const missingCategoryFields = requiredCategoryFields.filter(field => !(field in categoryData));
          
          if (missingCategoryFields.length > 0) {
            totalCategoryIssues++;
          }

          // Check data consistency
          if (categoryData.amount < 0) {
            totalCategoryIssues++;
          }

          if (categoryData.percentage < 0 || categoryData.percentage > 100) {
            totalCategoryIssues++;
          }

          if (categoryData.transactionCount < 0) {
            totalCategoryIssues++;
          }
        });
      });

      const passed = totalCategoryIssues === 0;
      
      return {
        test: 'Category Integrity',
        passed,
        message: passed 
          ? `All ${totalCategoriesChecked} categories validated successfully`
          : `Found ${totalCategoryIssues} issues in ${totalCategoriesChecked} categories`,
        data: { 
          categoriesChecked: totalCategoriesChecked,
          issuesFound: totalCategoryIssues
        }
      };

    } catch (error) {
      return {
        test: 'Category Integrity',
        passed: false,
        message: `Category integrity validation failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Test year-over-year metrics calculation
   */
  private static async testMetricsCalculation(userId: string): Promise<ValidationResult> {
    try {
      const data = await YearOverYearService.fetchYearOverYearData(userId);
      
      if (data.length < 2) {
        return {
          test: 'Metrics Calculation',
          passed: true,
          message: 'Insufficient data for YoY metrics calculation',
          data: { dataYears: data.length }
        };
      }

      const metrics = YearOverYearService.calculateYearOverYearMetrics(data[0], data[1]);
      
      const requiredMetricFields = [
        'spendingGrowth', 'incomeGrowth', 'netIncomeGrowth', 'transactionGrowth',
        'categoryGrowth', 'monthlyComparison', 'quarterlyComparison',
        'averageTransactionSizeGrowth', 'savingsRateChange'
      ];

      const missingMetricFields = requiredMetricFields.filter(field => !(field in metrics));
      
      if (missingMetricFields.length > 0) {
        return {
          test: 'Metrics Calculation',
          passed: false,
          message: `Missing metric fields: ${missingMetricFields.join(', ')}`,
          data: { missingMetricFields }
        };
      }

      // Validate growth calculations are reasonable (not infinite or NaN)
      const growthFields = ['spendingGrowth', 'incomeGrowth', 'netIncomeGrowth', 'transactionGrowth'];
      const invalidGrowth = growthFields.filter(field => 
        !isFinite(metrics[field as keyof typeof metrics] as number)
      );

      if (invalidGrowth.length > 0) {
        return {
          test: 'Metrics Calculation',
          passed: false,
          message: `Invalid growth calculations: ${invalidGrowth.join(', ')}`,
          data: { invalidGrowth, metrics }
        };
      }

      return {
        test: 'Metrics Calculation',
        passed: true,
        message: 'All YoY metrics calculated successfully',
        data: { 
          spendingGrowth: metrics.spendingGrowth,
          incomeGrowth: metrics.incomeGrowth,
          categoriesAnalyzed: Object.keys(metrics.categoryGrowth).length
        }
      };

    } catch (error) {
      return {
        test: 'Metrics Calculation',
        passed: false,
        message: `Metrics calculation failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Test predictive analytics integration
   */
  private static async testPredictiveAnalytics(userId: string): Promise<ValidationResult> {
    try {
      const [insights, forecasts] = await Promise.all([
        PredictiveAnalyticsService.generatePredictiveInsights(userId),
        PredictiveAnalyticsService.generateSpendingForecast(userId)
      ]);

      if (!Array.isArray(insights) || !Array.isArray(forecasts)) {
        return {
          test: 'Predictive Analytics',
          passed: false,
          message: 'Predictive analytics returned non-array results',
          data: { insights: typeof insights, forecasts: typeof forecasts }
        };
      }

      // Validate insight structure
      if (insights.length > 0) {
        const insightRequiredFields = ['type', 'category', 'title', 'description', 'confidence', 'impact', 'timeframe'];
        const missingInsightFields = insightRequiredFields.filter(field => 
          !(field in insights[0])
        );

        if (missingInsightFields.length > 0) {
          return {
            test: 'Predictive Analytics',
            passed: false,
            message: `Missing insight fields: ${missingInsightFields.join(', ')}`,
            data: { missingInsightFields }
          };
        }
      }

      // Validate forecast structure
      if (forecasts.length > 0) {
        const forecastRequiredFields = ['month', 'year', 'predictedSpending', 'predictedIncome', 'confidence', 'factors'];
        const missingForecastFields = forecastRequiredFields.filter(field => 
          !(field in forecasts[0])
        );

        if (missingForecastFields.length > 0) {
          return {
            test: 'Predictive Analytics',
            passed: false,
            message: `Missing forecast fields: ${missingForecastFields.join(', ')}`,
            data: { missingForecastFields }
          };
        }
      }

      return {
        test: 'Predictive Analytics',
        passed: true,
        message: `Generated ${insights.length} insights and ${forecasts.length} forecasts`,
        data: { 
          insightsCount: insights.length,
          forecastsCount: forecasts.length,
          highConfidenceInsights: insights.filter(i => i.confidence >= 80).length
        }
      };

    } catch (error) {
      return {
        test: 'Predictive Analytics',
        passed: false,
        message: `Predictive analytics failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Test edge cases handling
   */
  private static async testEdgeCases(userId: string): Promise<ValidationResult> {
    try {
      const edgeCaseResults = [];

      // Test with invalid user ID
      try {
        const invalidData = await YearOverYearService.fetchYearOverYearData('invalid-user-id');
        edgeCaseResults.push({
          case: 'Invalid User ID',
          passed: Array.isArray(invalidData) && invalidData.length === 0,
          result: invalidData
        });
      } catch (error) {
        edgeCaseResults.push({
          case: 'Invalid User ID',
          passed: true, // Expected to fail
          result: `Error thrown as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test with specific years (including future year)
      const futureYear = new Date().getFullYear() + 1;
      const futureData = await YearOverYearService.fetchYearOverYearData(userId, [futureYear]);
      edgeCaseResults.push({
        case: 'Future Year',
        passed: Array.isArray(futureData),
        result: futureData.length
      });

      // Test with empty years array
      const emptyYearsData = await YearOverYearService.fetchYearOverYearData(userId, []);
      edgeCaseResults.push({
        case: 'Empty Years Array',
        passed: Array.isArray(emptyYearsData),
        result: emptyYearsData.length
      });

      const allPassed = edgeCaseResults.every(result => result.passed);

      return {
        test: 'Edge Cases',
        passed: allPassed,
        message: allPassed 
          ? 'All edge cases handled correctly'
          : 'Some edge cases failed',
        data: { edgeCaseResults }
      };

    } catch (error) {
      return {
        test: 'Edge Cases',
        passed: false,
        message: `Edge case testing failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Test performance characteristics
   */
  private static async testPerformance(userId: string): Promise<ValidationResult> {
    try {
      const performanceResults = [];

      // Test data fetching performance
      const startTime = Date.now();
      const data = await YearOverYearService.fetchYearOverYearData(userId);
      const fetchDuration = Date.now() - startTime;

      performanceResults.push({
        operation: 'Data Fetching',
        duration: fetchDuration,
        dataSize: data.length,
        acceptable: fetchDuration < 5000 // Should complete within 5 seconds
      });

      // Test metrics calculation performance (if data available)
      if (data.length >= 2) {
        const metricsStartTime = Date.now();
        YearOverYearService.calculateYearOverYearMetrics(data[0], data[1]);
        const metricsDuration = Date.now() - metricsStartTime;

        performanceResults.push({
          operation: 'Metrics Calculation',
          duration: metricsDuration,
          dataSize: data.length,
          acceptable: metricsDuration < 1000 // Should complete within 1 second
        });
      }

      const allAcceptable = performanceResults.every(result => result.acceptable);

      return {
        test: 'Performance',
        passed: allAcceptable,
        message: allAcceptable 
          ? 'All operations within acceptable performance limits'
          : 'Some operations exceeded performance thresholds',
        data: { performanceResults }
      };

    } catch (error) {
      return {
        test: 'Performance',
        passed: false,
        message: `Performance testing failed: ${error}`,
        data: { error }
      };
    }
  }

  /**
   * Generate a summary report of validation results
   */
  static generateReport(results: ValidationResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = `Year-over-Year Validation Report\n`;
    report += `=====================================\n`;
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${passedTests}\n`;
    report += `Failed: ${failedTests}\n`;
    report += `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${status} - ${result.test}: ${result.message}\n`;
    });

    if (failedTests > 0) {
      report += `\nFailed Test Details:\n`;
      report += `====================\n`;
      results.filter(r => !r.passed).forEach(result => {
        report += `${result.test}: ${result.message}\n`;
        if (result.data) {
          report += `  Data: ${JSON.stringify(result.data, null, 2)}\n`;
        }
        report += `\n`;
      });
    }

    return report;
  }
}

// Export utility function for quick validation
export async function validateYearOverYearFunctionality(userId?: string): Promise<string> {
  if (!userId) {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return 'Error: No authenticated user found for validation';
    }
    userId = userData.user.id;
  }

  const results = await YearOverYearValidator.runValidationSuite(userId);
  return YearOverYearValidator.generateReport(results);
}