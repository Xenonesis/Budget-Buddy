/**
 * Privacy and security measures for AI financial interactions
 */

export interface AIPrivacySettings {
  dataSharing: boolean;
  anonymizeTransactions: boolean;
  retentionPeriod: number; // days
  allowInvestmentAdvice: boolean;
  allowDebtAdvice: boolean;
  maxConversationHistory: number;
}

/**
 * Default privacy settings - secure by default
 */
export const DEFAULT_PRIVACY_SETTINGS: AIPrivacySettings = {
  dataSharing: false,
  anonymizeTransactions: true,
  retentionPeriod: 30, // 30 days
  allowInvestmentAdvice: true,
  allowDebtAdvice: true,
  maxConversationHistory: 10
};

/**
 * Anonymizes sensitive financial data for AI processing
 */
export function anonymizeFinancialData(data: any): any {
  if (!data) return data;

  // Remove or anonymize sensitive fields
  const anonymized = { ...data };
  
  // Anonymize user identifiers
  if (anonymized.userId) {
    anonymized.userId = 'user_' + anonymized.userId.slice(-4);
  }
  
  if (anonymized.username) {
    delete anonymized.username;
  }
  
  // Anonymize transaction descriptions but keep categories
  if (anonymized.recentTransactions) {
    anonymized.recentTransactions = anonymized.recentTransactions.map((transaction: any) => ({
      ...transaction,
      description: anonymizeDescription(transaction.description),
      id: 'txn_' + transaction.id.slice(-4)
    }));
  }
  
  // Keep financial amounts and categories as they're necessary for advice
  // But remove specific merchant/vendor information
  
  return anonymized;
}

/**
 * Anonymizes transaction descriptions while preserving useful context
 */
function anonymizeDescription(description: string): string {
  if (!description) return description;
  
  // Common patterns to anonymize
  const patterns = [
    // Credit card numbers
    /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
    // Account numbers
    /account\s+\d+/gi,
    // Reference numbers
    /ref\s*#?\s*\d+/gi,
    // Transaction IDs
    /id\s*:?\s*\d+/gi,
    // Specific merchant names (keep general categories)
    /\b[A-Z][a-z]+\s+(store|shop|market|restaurant|cafe|inc|llc|ltd)\b/gi
  ];
  
  let anonymized = description;
  patterns.forEach((pattern, index) => {
    anonymized = anonymized.replace(pattern, `[REDACTED_${index}]`);
  });
  
  return anonymized;
}

/**
 * Validates that AI responses don't contain harmful financial advice
 */
export function validateAIResponse(response: string): { 
  isValid: boolean; 
  warnings: string[]; 
  errors: string[] 
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const lowerResponse = response.toLowerCase();
  
  // Check for potentially harmful investment advice
  const riskyInvestmentTerms = [
    'guaranteed return',
    'risk-free investment',
    'get rich quick',
    'sure thing',
    'can\'t lose',
    'guaranteed profit',
    'no risk'
  ];
  
  riskyInvestmentTerms.forEach(term => {
    if (lowerResponse.includes(term)) {
      errors.push(`Response contains potentially misleading investment language: "${term}"`);
    }
  });
  
  // Check for inappropriate debt advice
  const riskyDebtTerms = [
    'default on',
    'stop paying',
    'declare bankruptcy immediately',
    'don\'t pay your',
    'ignore debt collectors'
  ];
  
  riskyDebtTerms.forEach(term => {
    if (lowerResponse.includes(term)) {
      errors.push(`Response contains potentially harmful debt advice: "${term}"`);
    }
  });
  
  // Check for missing disclaimers
  const needsDisclaimer = [
    'invest in',
    'buy stocks',
    'investment strategy',
    'portfolio allocation',
    'tax advice',
    'legal advice'
  ];
  
  const hasDisclaimer = lowerResponse.includes('disclaimer') || 
                       lowerResponse.includes('not financial advice') || 
                       lowerResponse.includes('consult a professional') ||
                       lowerResponse.includes('seek professional advice');
  
  needsDisclaimer.forEach(term => {
    if (lowerResponse.includes(term) && !hasDisclaimer) {
      warnings.push('Investment/legal advice should include appropriate disclaimers');
    }
  });
  
  // Check for overly specific predictions
  const specificPredictions = [
    /will increase by \d+%/gi,
    /guaranteed to grow/gi,
    /will definitely/gi,
    /market will crash/gi,
    /stock will go to/gi
  ];
  
  specificPredictions.forEach(pattern => {
    if (pattern.test(response)) {
      warnings.push('Response contains overly specific market predictions');
    }
  });
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Adds appropriate disclaimers to AI financial advice
 */
export function addFinancialDisclaimers(response: string, topicType: 'investment' | 'debt' | 'tax' | 'general'): string {
  let disclaimer = '';
  
  switch (topicType) {
    case 'investment':
      disclaimer = '\n\n**Disclaimer:** This is educational information only and not personalized investment advice. All investments carry risk, including potential loss of principal. Please consult with a qualified financial advisor before making investment decisions.';
      break;
    case 'debt':
      disclaimer = '\n\n**Disclaimer:** This is general guidance based on your financial data. For complex debt situations, please consult with a qualified financial counselor or attorney who can review your specific circumstances.';
      break;
    case 'tax':
      disclaimer = '\n\n**Disclaimer:** This information is for educational purposes only and should not be considered tax advice. Tax situations are highly individual. Please consult with a qualified tax professional for advice specific to your situation.';
      break;
    default:
      disclaimer = '\n\n**Disclaimer:** This advice is based on your financial data and general financial principles. Consider consulting with a qualified financial professional for personalized guidance.';
  }
  
  // Only add disclaimer if not already present
  if (!response.toLowerCase().includes('disclaimer') && !response.toLowerCase().includes('not financial advice')) {
    return response + disclaimer;
  }
  
  return response;
}

/**
 * Determines the topic type from the response for appropriate disclaimers
 */
export function detectFinancialTopicType(response: string): 'investment' | 'debt' | 'tax' | 'general' {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('invest') || lowerResponse.includes('stock') || 
      lowerResponse.includes('portfolio') || lowerResponse.includes('401k') ||
      lowerResponse.includes('ira') || lowerResponse.includes('mutual fund')) {
    return 'investment';
  }
  
  if (lowerResponse.includes('debt') || lowerResponse.includes('loan') || 
      lowerResponse.includes('credit card') || lowerResponse.includes('mortgage') ||
      lowerResponse.includes('bankruptcy') || lowerResponse.includes('default')) {
    return 'debt';
  }
  
  if (lowerResponse.includes('tax') || lowerResponse.includes('deduction') || 
      lowerResponse.includes('irs') || lowerResponse.includes('refund') ||
      lowerResponse.includes('write-off')) {
    return 'tax';
  }
  
  return 'general';
}

/**
 * Checks if user has consented to AI financial advice
 */
export async function checkAIConsent(userId: string): Promise<boolean> {
  // This would integrate with your user preferences/settings system
  // For now, we'll assume consent is given if AI is enabled
  return true;
}

/**
 * Logs AI interactions for audit purposes (anonymized)
 */
export function logAIInteraction(userId: string, query: string, response: string, validation: any): void {
  // Anonymize sensitive data in logs
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: 'user_' + userId.slice(-4),
    queryType: detectFinancialTopicType(query),
    responseLength: response.length,
    validationResult: {
      isValid: validation.isValid,
      warningCount: validation.warnings.length,
      errorCount: validation.errors.length
    },
    // Don't log actual content for privacy
  };
  
  console.log('AI Financial Interaction:', logEntry);
  
  // In production, you'd want to send this to a secure logging service
}

/**
 * Rate limiting is now handled by the quota manager system
 * This provides more accurate, provider-specific daily quotas
 */

/**
 * Cleans up old conversation history based on retention policy
 */
export async function cleanupAIHistory(userId: string, retentionDays = 30): Promise<void> {
  // This would integrate with your database to clean up old AI conversations
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  console.log(`Would clean up AI conversations for user ${userId} older than ${cutoffDate.toISOString()}`);
  // Implementation would depend on your database structure
}