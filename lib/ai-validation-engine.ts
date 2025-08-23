export interface ValidationRule {
  field: string;
  validator: (value: any, context?: any) => ValidationResult;
  weight: number;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  correctedValue?: any;
  reasoning?: string;
}

export interface AIValidationContext {
  extractedText: string;
  fileType: string;
  fileName: string;
  processingMethod: string;
}

export class AIValidationEngine {
  private rules: ValidationRule[] = [];
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {
    this.initializeRules();
    this.loadKnowledgeBase();
  }

  private initializeRules() {
    this.rules = [
      {
        field: 'amount',
        validator: this.validateAmountWithAI.bind(this),
        weight: 0.3
      },
      {
        field: 'date',
        validator: this.validateDateWithAI.bind(this),
        weight: 0.25
      },
      {
        field: 'merchant',
        validator: this.validateMerchantWithAI.bind(this),
        weight: 0.2
      },
      {
        field: 'category',
        validator: this.validateCategoryWithAI.bind(this),
        weight: 0.15
      },
      {
        field: 'transactionId',
        validator: this.validateTransactionIdWithAI.bind(this),
        weight: 0.1
      }
    ];
  }

  private loadKnowledgeBase() {
    // Merchant patterns and their typical transaction ranges
    this.knowledgeBase.set('merchantPatterns', {
      'zomato': { minAmount: 50, maxAmount: 2000, category: 'Food & Dining', type: 'expense' },
      'swiggy': { minAmount: 50, maxAmount: 2000, category: 'Food & Dining', type: 'expense' },
      'uber': { minAmount: 30, maxAmount: 1000, category: 'Transportation', type: 'expense' },
      'ola': { minAmount: 30, maxAmount: 1000, category: 'Transportation', type: 'expense' },
      'amazon': { minAmount: 100, maxAmount: 50000, category: 'Shopping', type: 'expense' },
      'flipkart': { minAmount: 100, maxAmount: 50000, category: 'Shopping', type: 'expense' },
      'paytm': { minAmount: 10, maxAmount: 100000, category: 'Digital Payment', type: 'expense' },
      'razorpay': { minAmount: 10, maxAmount: 100000, category: 'Digital Payment', type: 'expense' }
    });

    // Common transaction ID patterns
    this.knowledgeBase.set('transactionIdPatterns', [
      /^[A-Z0-9]{10,20}$/, // Standard alphanumeric
      /^TXN[A-Z0-9]{8,15}$/, // Transaction prefix
      /^UPI[A-Z0-9]{8,15}$/, // UPI prefix
      /^[0-9]{12,16}$/ // Numeric only
    ]);

    // Date validation ranges
    this.knowledgeBase.set('dateRanges', {
      minDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days future
    });
  }

  async validateWithAI(data: any, context: AIValidationContext): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.rules) {
      if (data[rule.field] !== undefined) {
        const result = rule.validator(data[rule.field], { ...context, fullData: data });
        results.push({
          ...result,
          field: rule.field,
          weight: rule.weight
        } as any);
      }
    }

    // Cross-validate fields for consistency
    const crossValidation = this.performCrossValidation(data, context);
    results.push(...crossValidation);

    return results;
  }

  private validateAmountWithAI(amount: number, context: any): ValidationResult {
    let confidence = 0.5;
    const suggestions: string[] = [];
    let correctedValue = amount;
    let reasoning = '';

    // Basic range validation
    if (amount <= 0) {
      return {
        isValid: false,
        confidence: 0,
        suggestions: ['Amount must be greater than zero'],
        reasoning: 'Invalid amount detected'
      };
    }

    if (amount > 0 && amount <= 1000000) {
      confidence += 0.3;
      reasoning += 'Amount within reasonable range. ';
    } else if (amount > 1000000) {
      confidence -= 0.2;
      suggestions.push('Very large amount detected - please verify');
      reasoning += 'Unusually large amount. ';
    }

    // Context-based validation
    if (context.fullData?.merchant) {
      const merchantData = this.getMerchantData(context.fullData.merchant);
      if (merchantData) {
        if (amount >= merchantData.minAmount && amount <= merchantData.maxAmount) {
          confidence += 0.3;
          reasoning += `Amount consistent with ${context.fullData.merchant} transactions. `;
        } else {
          confidence -= 0.1;
          suggestions.push(`Amount seems unusual for ${context.fullData.merchant}`);
          reasoning += `Amount outside typical range for ${context.fullData.merchant}. `;
        }
      }
    }

    // Text frequency validation
    const amountStr = amount.toString();
    const occurrences = (context.extractedText.match(new RegExp(amountStr.replace('.', '\\.'), 'g')) || []).length;
    if (occurrences >= 2) {
      confidence += 0.2;
      reasoning += 'Amount appears multiple times in text. ';
    }

    // Decimal precision check
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces <= 2) {
      confidence += 0.1;
    } else {
      confidence -= 0.1;
      correctedValue = Math.round(amount * 100) / 100;
      suggestions.push('Rounded to 2 decimal places');
      reasoning += 'Adjusted decimal precision. ';
    }

    return {
      isValid: amount > 0,
      confidence: Math.min(confidence, 1),
      suggestions,
      correctedValue: correctedValue !== amount ? correctedValue : undefined,
      reasoning: reasoning.trim()
    };
  }

  private validateDateWithAI(dateStr: string, context: any): ValidationResult {
    let confidence = 0.5;
    const suggestions: string[] = [];
    let reasoning = '';

    try {
      const date = new Date(dateStr);
      const ranges = this.knowledgeBase.get('dateRanges');

      if (isNaN(date.getTime())) {
        return {
          isValid: false,
          confidence: 0,
          suggestions: ['Invalid date format'],
          reasoning: 'Date parsing failed'
        };
      }

      // Range validation
      if (date >= ranges.minDate && date <= ranges.maxDate) {
        confidence += 0.4;
        reasoning += 'Date within valid range. ';
      } else {
        confidence -= 0.3;
        if (date < ranges.minDate) {
          suggestions.push('Date is too old - please verify');
          reasoning += 'Date is older than expected. ';
        } else {
          suggestions.push('Future date detected - please verify');
          reasoning += 'Date is in the future. ';
        }
      }

      // Recent transaction bonus
      const daysDiff = Math.abs((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 30) {
        confidence += 0.2;
        reasoning += 'Recent transaction. ';
      }

      // Weekend/holiday pattern analysis
      const dayOfWeek = date.getDay();
      if (context.fullData?.category === 'Food & Dining' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        confidence += 0.1;
        reasoning += 'Weekend dining transaction pattern. ';
      }

      return {
        isValid: true,
        confidence: Math.min(confidence, 1),
        suggestions,
        reasoning: reasoning.trim()
      };
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        suggestions: ['Date validation failed'],
        reasoning: 'Date processing error'
      };
    }
  }

  private validateMerchantWithAI(merchant: string, context: any): ValidationResult {
    let confidence = 0.5;
    const suggestions: string[] = [];
    let correctedValue = merchant;
    let reasoning = '';

    // Basic validation
    if (!merchant || merchant.length < 2) {
      return {
        isValid: false,
        confidence: 0,
        suggestions: ['Merchant name too short'],
        reasoning: 'Invalid merchant name'
      };
    }

    // Length validation
    if (merchant.length >= 3 && merchant.length <= 50) {
      confidence += 0.2;
      reasoning += 'Merchant name length appropriate. ';
    } else if (merchant.length > 50) {
      confidence -= 0.1;
      correctedValue = merchant.substring(0, 50);
      suggestions.push('Merchant name truncated');
      reasoning += 'Merchant name was too long. ';
    }

    // Known merchant validation
    const merchantData = this.getMerchantData(merchant);
    if (merchantData) {
      confidence += 0.3;
      reasoning += 'Known merchant detected. ';
      
      // Validate consistency with amount
      if (context.fullData?.amount) {
        const amount = context.fullData.amount;
        if (amount >= merchantData.minAmount && amount <= merchantData.maxAmount) {
          confidence += 0.2;
          reasoning += 'Amount consistent with merchant. ';
        }
      }
    }

    // Text cleaning and validation
    const cleanedMerchant = merchant.replace(/[^a-zA-Z\s&.-]/g, '').trim();
    if (cleanedMerchant !== merchant) {
      correctedValue = cleanedMerchant;
      suggestions.push('Cleaned merchant name');
      reasoning += 'Removed invalid characters. ';
    }

    // Common word filtering
    const commonWords = ['the', 'and', 'or', 'pvt', 'ltd', 'inc'];
    const hasOnlyCommonWords = cleanedMerchant.toLowerCase().split(' ')
      .every(word => commonWords.includes(word));
    
    if (hasOnlyCommonWords) {
      confidence -= 0.3;
      suggestions.push('Merchant name seems generic');
      reasoning += 'Generic merchant name detected. ';
    }

    return {
      isValid: cleanedMerchant.length >= 2,
      confidence: Math.min(confidence, 1),
      suggestions,
      correctedValue: correctedValue !== merchant ? correctedValue : undefined,
      reasoning: reasoning.trim()
    };
  }

  private validateCategoryWithAI(category: string, context: any): ValidationResult {
    let confidence = 0.5;
    const suggestions: string[] = [];
    let reasoning = '';

    // Validate against merchant if available
    if (context.fullData?.merchant) {
      const merchantData = this.getMerchantData(context.fullData.merchant);
      if (merchantData && merchantData.category === category) {
        confidence += 0.4;
        reasoning += 'Category matches merchant pattern. ';
      } else if (merchantData) {
        confidence -= 0.2;
        suggestions.push(`Consider "${merchantData.category}" based on merchant`);
        reasoning += 'Category mismatch with merchant. ';
      }
    }

    // Validate against amount patterns
    if (context.fullData?.amount) {
      const amount = context.fullData.amount;
      if (category === 'Food & Dining' && amount >= 50 && amount <= 2000) {
        confidence += 0.2;
        reasoning += 'Amount typical for food category. ';
      } else if (category === 'Transportation' && amount >= 30 && amount <= 1000) {
        confidence += 0.2;
        reasoning += 'Amount typical for transport category. ';
      }
    }

    // Text analysis for category keywords
    const categoryKeywords = this.getCategoryKeywords(category);
    const textLower = context.extractedText.toLowerCase();
    const keywordMatches = categoryKeywords.filter(keyword => textLower.includes(keyword));
    
    if (keywordMatches.length > 0) {
      confidence += Math.min(keywordMatches.length * 0.1, 0.3);
      reasoning += `Found category keywords: ${keywordMatches.join(', ')}. `;
    }

    return {
      isValid: true,
      confidence: Math.min(confidence, 1),
      suggestions,
      reasoning: reasoning.trim()
    };
  }

  private validateTransactionIdWithAI(transactionId: string, context: any): ValidationResult {
    let confidence = 0.5;
    const suggestions: string[] = [];
    let reasoning = '';

    if (!transactionId || transactionId.length < 6) {
      return {
        isValid: false,
        confidence: 0.2,
        suggestions: ['Transaction ID too short'],
        reasoning: 'Invalid transaction ID length'
      };
    }

    // Pattern validation
    const patterns = this.knowledgeBase.get('transactionIdPatterns');
    const matchesPattern = patterns.some((pattern: RegExp) => pattern.test(transactionId));
    
    if (matchesPattern) {
      confidence += 0.4;
      reasoning += 'Transaction ID matches known pattern. ';
    } else {
      confidence -= 0.1;
      suggestions.push('Unusual transaction ID format');
      reasoning += 'Transaction ID format is unusual. ';
    }

    // Length validation
    if (transactionId.length >= 8 && transactionId.length <= 20) {
      confidence += 0.2;
      reasoning += 'Transaction ID length appropriate. ';
    }

    // Uniqueness check (basic)
    const hasRepeatingChars = /(.)\1{4,}/.test(transactionId);
    if (hasRepeatingChars) {
      confidence -= 0.2;
      suggestions.push('Transaction ID has repeating characters');
      reasoning += 'Suspicious repeating pattern. ';
    }

    return {
      isValid: transactionId.length >= 6,
      confidence: Math.min(confidence, 1),
      suggestions,
      reasoning: reasoning.trim()
    };
  }

  private performCrossValidation(data: any, context: AIValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Validate merchant-category consistency
    if (data.merchant && data.category) {
      const merchantData = this.getMerchantData(data.merchant);
      if (merchantData) {
        const isConsistent = merchantData.category === data.category;
        results.push({
          field: 'merchant-category',
          isValid: isConsistent,
          confidence: isConsistent ? 0.9 : 0.3,
          suggestions: isConsistent ? [] : [`Consider "${merchantData.category}" category`],
          reasoning: isConsistent ? 'Merchant and category are consistent' : 'Merchant and category mismatch'
        } as any);
      }
    }

    // Validate amount-merchant consistency
    if (data.amount && data.merchant) {
      const merchantData = this.getMerchantData(data.merchant);
      if (merchantData) {
        const isInRange = data.amount >= merchantData.minAmount && data.amount <= merchantData.maxAmount;
        results.push({
          field: 'amount-merchant',
          isValid: isInRange,
          confidence: isInRange ? 0.8 : 0.4,
          suggestions: isInRange ? [] : ['Amount seems unusual for this merchant'],
          reasoning: isInRange ? 'Amount consistent with merchant' : 'Amount outside typical range'
        } as any);
      }
    }

    return results;
  }

  private getMerchantData(merchant: string): any {
    const patterns = this.knowledgeBase.get('merchantPatterns');
    const merchantLower = merchant.toLowerCase();
    
    for (const [key, data] of Object.entries(patterns)) {
      if (merchantLower.includes(key)) {
        return data;
      }
    }
    return null;
  }

  private getCategoryKeywords(category: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'Food & Dining': ['food', 'restaurant', 'cafe', 'dining', 'meal', 'eat'],
      'Transportation': ['transport', 'taxi', 'uber', 'ola', 'fuel', 'travel'],
      'Shopping': ['shop', 'store', 'purchase', 'buy', 'mall'],
      'Utilities': ['bill', 'electricity', 'water', 'gas', 'internet'],
      'Entertainment': ['movie', 'game', 'entertainment', 'fun'],
      'Healthcare': ['medical', 'doctor', 'hospital', 'pharmacy']
    };
    
    return keywordMap[category] || [];
  }

  calculateOverallConfidence(validationResults: ValidationResult[]): number {
    if (validationResults.length === 0) return 0.5;
    
    const weightedSum = validationResults.reduce((sum, result) => {
      const weight = (result as any).weight || 0.1;
      return sum + (result.confidence * weight);
    }, 0);
    
    const totalWeight = validationResults.reduce((sum, result) => {
      return sum + ((result as any).weight || 0.1);
    }, 0);
    
    return Math.min(weightedSum / totalWeight, 1);
  }
}