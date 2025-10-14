import { supabase } from './supabase';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalTransactions: number;
    totalBudgets: number;
    dataIntegrityScore: number;
    lastValidated: string;
  };
}

export class DataValidationService {
  /**
   * Comprehensive data validation for production readiness
   */
  static async validateUserData(userId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let totalTransactions = 0;
    let totalBudgets = 0;
    let validTransactions = 0;
    let validBudgets = 0;

    try {
      // Validate transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (transactionError) {
        errors.push(`Transaction fetch error: ${transactionError.message}`);
      } else if (transactions) {
        totalTransactions = transactions.length;
        
        for (const transaction of transactions) {
          // Validate required fields
          if (!transaction.amount || transaction.amount <= 0) {
            errors.push(`Invalid transaction amount: ${transaction.id}`);
          } else {
            validTransactions++;
          }

          if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
            errors.push(`Invalid transaction type: ${transaction.id}`);
          }

          if (!transaction.date) {
            errors.push(`Missing transaction date: ${transaction.id}`);
          } else {
            const transactionDate = new Date(transaction.date);
            if (isNaN(transactionDate.getTime())) {
              errors.push(`Invalid transaction date format: ${transaction.id}`);
            }
          }

          // Validate category relationship
          if (transaction.category_id) {
            const { data: category } = await supabase
              .from('categories')
              .select('id')
              .eq('id', transaction.category_id)
              .single();
            
            if (!category) {
              warnings.push(`Transaction references non-existent category: ${transaction.id}`);
            }
          }
        }
      }

      // Validate budgets
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (budgetError) {
        errors.push(`Budget fetch error: ${budgetError.message}`);
      } else if (budgets) {
        totalBudgets = budgets.length;
        
        for (const budget of budgets) {
          // Validate required fields
          if (!budget.amount || budget.amount <= 0) {
            errors.push(`Invalid budget amount: ${budget.id}`);
          } else {
            validBudgets++;
          }

          if (!budget.period || !['weekly', 'monthly', 'yearly'].includes(budget.period)) {
            errors.push(`Invalid budget period: ${budget.id}`);
          }

          // Validate category relationship
          if (budget.category_id) {
            const { data: category } = await supabase
              .from('categories')
              .select('id')
              .eq('id', budget.category_id)
              .single();
            
            if (!category) {
              errors.push(`Budget references non-existent category: ${budget.id}`);
            }
          }
        }
      }

      // Validate categories
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (categoryError) {
        errors.push(`Category fetch error: ${categoryError.message}`);
      } else if (categories) {
        for (const category of categories) {
          if (!category.name || category.name.trim() === '') {
            errors.push(`Category missing name: ${category.id}`);
          }

          if (!category.type || !['income', 'expense', 'both'].includes(category.type)) {
            warnings.push(`Category has invalid type: ${category.id}`);
          }
        }
      }

      // Calculate data integrity score
      const totalItems = totalTransactions + totalBudgets;
      const validItems = validTransactions + validBudgets;
      const dataIntegrityScore = totalItems > 0 ? Math.round((validItems / totalItems) * 100) : 100;

      // Additional warnings for data quality
      if (totalTransactions === 0) {
        warnings.push('No transactions found - user may need to add financial data');
      }

      if (totalBudgets === 0) {
        warnings.push('No budgets found - user may benefit from setting up budgets');
      }

      if (totalTransactions > 0 && validTransactions / totalTransactions < 0.9) {
        warnings.push('More than 10% of transactions have data quality issues');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        summary: {
          totalTransactions,
          totalBudgets,
          dataIntegrityScore,
          lastValidated: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        summary: {
          totalTransactions: 0,
          totalBudgets: 0,
          dataIntegrityScore: 0,
          lastValidated: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Validate financial calculations accuracy
   */
  static async validateFinancialCalculations(userId: string): Promise<{
    calculationsValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Get user's transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (!transactions) {
        return { calculationsValid: true, issues: ['No transactions to validate'] };
      }

      // Validate income/expense calculations
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Check for negative amounts in wrong categories
      const negativeIncomes = transactions.filter(t => t.type === 'income' && t.amount < 0);
      const negativeExpenses = transactions.filter(t => t.type === 'expense' && t.amount < 0);

      if (negativeIncomes.length > 0) {
        issues.push(`Found ${negativeIncomes.length} income transactions with negative amounts`);
      }

      if (negativeExpenses.length > 0) {
        issues.push(`Found ${negativeExpenses.length} expense transactions with negative amounts`);
      }

      // Validate budget calculations
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (budgets) {
        for (const budget of budgets) {
          const categoryTransactions = transactions.filter(t => 
            t.category_id === budget.category_id && t.type === 'expense'
          );
          
          const spent = categoryTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
          
          if (spent > budget.amount * 2) {
            issues.push(`Category ${budget.category_id} spending (${spent}) is unusually high compared to budget (${budget.amount})`);
          }
        }
      }

      return {
        calculationsValid: issues.length === 0,
        issues
      };

    } catch (error) {
      return {
        calculationsValid: false,
        issues: [`Calculation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validate data consistency across related tables
   */
  static async validateDataConsistency(userId: string): Promise<{
    consistencyValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check for orphaned transactions (referencing non-existent categories)
      const { data: orphanedTransactions } = await supabase
        .from('transactions')
        .select('id, category_id')
        .eq('user_id', userId)
        .not('category_id', 'is', null);

      if (orphanedTransactions) {
        for (const transaction of orphanedTransactions) {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('id', transaction.category_id)
            .single();

          if (!category) {
            issues.push(`Transaction ${transaction.id} references non-existent category ${transaction.category_id}`);
          }
        }
      }

      // Check for orphaned budgets
      const { data: orphanedBudgets } = await supabase
        .from('budgets')
        .select('id, category_id')
        .eq('user_id', userId);

      if (orphanedBudgets) {
        for (const budget of orphanedBudgets) {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('id', budget.category_id)
            .single();

          if (!category) {
            issues.push(`Budget ${budget.id} references non-existent category ${budget.category_id}`);
          }
        }
      }

      // Check for duplicate categories
      const { data: categories } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', userId);

      if (categories) {
        const categoryNames = categories.map(c => c.name.toLowerCase());
        const duplicates = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);
        
        if (duplicates.length > 0) {
          issues.push(`Found duplicate category names: ${[...new Set(duplicates)].join(', ')}`);
        }
      }

      return {
        consistencyValid: issues.length === 0,
        issues
      };

    } catch (error) {
      return {
        consistencyValid: false,
        issues: [`Consistency validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Run comprehensive validation suite
   */
  static async runFullValidation(userId: string): Promise<{
    overallValid: boolean;
    dataValidation: ValidationResult;
    calculationValidation: { calculationsValid: boolean; issues: string[] };
    consistencyValidation: { consistencyValid: boolean; issues: string[] };
    recommendations: string[];
  }> {
    const [dataValidation, calculationValidation, consistencyValidation] = await Promise.all([
      this.validateUserData(userId),
      this.validateFinancialCalculations(userId),
      this.validateDataConsistency(userId)
    ]);

    const recommendations: string[] = [];

    // Generate recommendations based on validation results
    if (dataValidation.summary.totalTransactions === 0) {
      recommendations.push('Add some transactions to start tracking your finances');
    }

    if (dataValidation.summary.totalBudgets === 0) {
      recommendations.push('Set up budgets to better manage your spending');
    }

    if (dataValidation.summary.dataIntegrityScore < 90) {
      recommendations.push('Review and fix data quality issues to improve accuracy');
    }

    if (!calculationValidation.calculationsValid) {
      recommendations.push('Review financial calculations for accuracy');
    }

    if (!consistencyValidation.consistencyValid) {
      recommendations.push('Fix data consistency issues to prevent errors');
    }

    const overallValid = dataValidation.isValid && 
                        calculationValidation.calculationsValid && 
                        consistencyValidation.consistencyValid;

    return {
      overallValid,
      dataValidation,
      calculationValidation,
      consistencyValidation,
      recommendations
    };
  }
}