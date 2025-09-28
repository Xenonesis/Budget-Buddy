/**
 * Duplicate Detection Engine - AI-powered duplicate detection across documents
 * USP: Smart duplicate detection with fuzzy matching and context awareness
 */

import { ExtractedTransactionData } from './ocr-processor';

interface DuplicateGroup {
  id: string;
  transactions: ExtractedTransactionData[];
  similarity: number;
  duplicateType: 'exact' | 'similar' | 'potential';
  confidence: number;
  reason: string;
}

interface DuplicateDetectionConfig {
  amountTolerance: number; // Percentage tolerance for amount matching
  dateTolerance: number; // Days tolerance for date matching
  merchantSimilarityThreshold: number; // 0-1 similarity threshold
  enableFuzzyMatching: boolean;
  enableContextualAnalysis: boolean;
}

interface DuplicateAnalysis {
  amountSimilarity: number;
  dateSimilarity: number;
  merchantSimilarity: number;
  contextSimilarity: number;
  overallSimilarity: number;
  duplicateType: 'exact' | 'similar' | 'potential';
  confidence: number;
  reason: string[];
}

export class DuplicateDetectionEngine {
  private config: DuplicateDetectionConfig;
  
  constructor(config?: Partial<DuplicateDetectionConfig>) {
    this.config = {
      amountTolerance: 0.01, // 1% tolerance
      dateTolerance: 1, // 1 day tolerance
      merchantSimilarityThreshold: 0.8,
      enableFuzzyMatching: true,
      enableContextualAnalysis: true,
      ...config
    };
  }

  /**
   * Detect duplicates across multiple transactions
   */
  async detectDuplicates(transactions: ExtractedTransactionData[]): Promise<DuplicateGroup[]> {
    const duplicateGroups: DuplicateGroup[] = [];
    const processedTransactions = new Set<number>();
    
    for (let i = 0; i < transactions.length; i++) {
      if (processedTransactions.has(i)) continue;
      
      const currentGroup: ExtractedTransactionData[] = [transactions[i]];
      const duplicates: number[] = [];
      
      for (let j = i + 1; j < transactions.length; j++) {
        if (processedTransactions.has(j)) continue;
        
        const analysis = await this.analyzeTransactionSimilarity(
          transactions[i],
          transactions[j]
        );
        
        if (this.isDuplicate(analysis)) {
          currentGroup.push(transactions[j]);
          duplicates.push(j);
        }
      }
      
      if (currentGroup.length > 1) {
        // Mark all as processed
        processedTransactions.add(i);
        duplicates.forEach(idx => processedTransactions.add(idx));
        
        // Create duplicate group
        const groupAnalysis = this.analyzeGroupSimilarity(currentGroup);
        duplicateGroups.push({
          id: this.generateGroupId(),
          transactions: currentGroup,
          similarity: groupAnalysis.overallSimilarity,
          duplicateType: groupAnalysis.duplicateType,
          confidence: groupAnalysis.confidence,
          reason: groupAnalysis.reason.join(', ')
        });
      }
    }
    
    return duplicateGroups;
  }

  /**
   * Analyze similarity between two transactions
   */
  private async analyzeTransactionSimilarity(
    transaction1: ExtractedTransactionData,
    transaction2: ExtractedTransactionData
  ): Promise<DuplicateAnalysis> {
    // Amount similarity
    const amountSimilarity = this.calculateAmountSimilarity(
      transaction1.amount,
      transaction2.amount
    );
    
    // Date similarity
    const dateSimilarity = this.calculateDateSimilarity(
      transaction1.date,
      transaction2.date
    );
    
    // Merchant similarity
    const merchantSimilarity = await this.calculateMerchantSimilarity(
      transaction1.merchant,
      transaction2.merchant
    );
    
    // Context similarity (category, payment method, etc.)
    const contextSimilarity = this.calculateContextSimilarity(
      transaction1,
      transaction2
    );
    
    // Calculate overall similarity
    const weights = {
      amount: 0.4,
      date: 0.3,
      merchant: 0.2,
      context: 0.1
    };
    
    const overallSimilarity = 
      amountSimilarity * weights.amount +
      dateSimilarity * weights.date +
      merchantSimilarity * weights.merchant +
      contextSimilarity * weights.context;
    
    // Determine duplicate type and confidence
    const { duplicateType, confidence, reason } = this.classifyDuplicate({
      amountSimilarity,
      dateSimilarity,
      merchantSimilarity,
      contextSimilarity,
      overallSimilarity
    });
    
    return {
      amountSimilarity,
      dateSimilarity,
      merchantSimilarity,
      contextSimilarity,
      overallSimilarity,
      duplicateType,
      confidence,
      reason
    };
  }

  /**
   * Calculate amount similarity
   */
  private calculateAmountSimilarity(
    amount1: number | undefined,
    amount2: number | undefined
  ): number {
    if (!amount1 || !amount2) return 0;
    
    // Exact match
    if (amount1 === amount2) return 1.0;
    
    // Percentage difference
    const difference = Math.abs(amount1 - amount2);
    const average = (amount1 + amount2) / 2;
    const percentageDiff = difference / average;
    
    if (percentageDiff <= this.config.amountTolerance) {
      return 1.0 - (percentageDiff / this.config.amountTolerance) * 0.2;
    }
    
    // Gradual similarity decrease
    return Math.max(0, 1.0 - percentageDiff);
  }

  /**
   * Calculate date similarity
   */
  private calculateDateSimilarity(
    date1: string | undefined,
    date2: string | undefined
  ): number {
    if (!date1 || !date2) return 0;
    
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      // Same date
      if (d1.getTime() === d2.getTime()) return 1.0;
      
      // Calculate days difference
      const diffTime = Math.abs(d1.getTime() - d2.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= this.config.dateTolerance) {
        return 1.0 - (diffDays / this.config.dateTolerance) * 0.3;
      }
      
      // Gradual similarity decrease for nearby dates
      if (diffDays <= 7) return 0.5 - (diffDays / 14);
      if (diffDays <= 30) return 0.2 - (diffDays / 150);
      
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate merchant similarity with fuzzy matching
   */
  private async calculateMerchantSimilarity(
    merchant1: string | undefined,
    merchant2: string | undefined
  ): Promise<number> {
    if (!merchant1 || !merchant2) return 0;
    
    // Exact match (case insensitive)
    if (merchant1.toLowerCase() === merchant2.toLowerCase()) return 1.0;
    
    if (!this.config.enableFuzzyMatching) return 0;
    
    // Normalize merchant names
    const normalized1 = this.normalizeMerchantName(merchant1);
    const normalized2 = this.normalizeMerchantName(merchant2);
    
    if (normalized1 === normalized2) return 0.95;
    
    // Fuzzy string matching
    const similarity = this.calculateStringSimilarity(normalized1, normalized2);
    
    // Check for common merchant variations
    const variationSimilarity = this.checkMerchantVariations(normalized1, normalized2);
    
    return Math.max(similarity, variationSimilarity);
  }

  /**
   * Calculate context similarity (category, transaction type, etc.)
   */
  private calculateContextSimilarity(
    transaction1: ExtractedTransactionData,
    transaction2: ExtractedTransactionData
  ): number {
    let similarity = 0;
    let factors = 0;
    
    // Category similarity
    if (transaction1.category && transaction2.category) {
      factors++;
      if (transaction1.category === transaction2.category) {
        similarity += 1.0;
      }
    }
    
    // Transaction type similarity
    if (transaction1.type && transaction2.type) {
      factors++;
      if (transaction1.type === transaction2.type) {
        similarity += 1.0;
      }
    }
    
    // Description similarity (if available)
    if (transaction1.description && transaction2.description) {
      factors++;
      const descSimilarity = this.calculateStringSimilarity(
        transaction1.description.toLowerCase(),
        transaction2.description.toLowerCase()
      );
      if (descSimilarity > 0.8) {
        similarity += descSimilarity;
      }
    }
    
    return factors > 0 ? similarity / factors : 0.5;
  }

  /**
   * Classify duplicate type and confidence
   */
  private classifyDuplicate(similarities: {
    amountSimilarity: number;
    dateSimilarity: number;
    merchantSimilarity: number;
    contextSimilarity: number;
    overallSimilarity: number;
  }): { duplicateType: 'exact' | 'similar' | 'potential'; confidence: number; reason: string[] } {
    const reason: string[] = [];
    
    // Exact duplicate
    if (similarities.amountSimilarity >= 1.0 && 
        similarities.dateSimilarity >= 1.0 && 
        similarities.merchantSimilarity >= 1.0) {
      reason.push('Exact match on amount, date, and merchant');
      return { duplicateType: 'exact', confidence: 0.99, reason };
    }
    
    // High similarity duplicate
    if (similarities.overallSimilarity >= 0.9) {
      if (similarities.amountSimilarity >= 0.95) reason.push('Very similar amounts');
      if (similarities.dateSimilarity >= 0.9) reason.push('Same or very close dates');
      if (similarities.merchantSimilarity >= 0.9) reason.push('Same or similar merchant');
      
      return { duplicateType: 'similar', confidence: similarities.overallSimilarity, reason };
    }
    
    // Potential duplicate
    if (similarities.overallSimilarity >= 0.7) {
      if (similarities.amountSimilarity >= 0.9) reason.push('Similar amounts');
      if (similarities.merchantSimilarity >= 0.8) reason.push('Similar merchant names');
      if (similarities.dateSimilarity >= 0.7) reason.push('Close dates');
      
      return { duplicateType: 'potential', confidence: similarities.overallSimilarity, reason };
    }
    
    return { duplicateType: 'potential', confidence: 0, reason: ['Not a duplicate'] };
  }

  /**
   * Check if analysis indicates a duplicate
   */
  private isDuplicate(analysis: DuplicateAnalysis): boolean {
    return analysis.overallSimilarity >= 0.7 && analysis.confidence > 0.5;
  }

  /**
   * Analyze similarity across a group of transactions
   */
  private analyzeGroupSimilarity(transactions: ExtractedTransactionData[]): DuplicateAnalysis {
    if (transactions.length < 2) {
      throw new Error('Need at least 2 transactions for group analysis');
    }
    
    let totalSimilarity = 0;
    let totalConfidence = 0;
    const allReasons = new Set<string>();
    let duplicateType: 'exact' | 'similar' | 'potential' = 'potential';
    
    // Compare each pair in the group
    for (let i = 0; i < transactions.length; i++) {
      for (let j = i + 1; j < transactions.length; j++) {
        // This would be async in real implementation
        const pairSimilarity = this.calculatePairSimilarity(transactions[i], transactions[j]);
        totalSimilarity += pairSimilarity.overallSimilarity;
        totalConfidence += pairSimilarity.confidence;
        pairSimilarity.reason.forEach(r => allReasons.add(r));
        
        if (pairSimilarity.duplicateType === 'exact') duplicateType = 'exact';
        else if (pairSimilarity.duplicateType === 'similar' && duplicateType !== 'exact') {
          duplicateType = 'similar';
        }
      }
    }
    
    const pairCount = (transactions.length * (transactions.length - 1)) / 2;
    const avgSimilarity = totalSimilarity / pairCount;
    const avgConfidence = totalConfidence / pairCount;
    
    return {
      amountSimilarity: avgSimilarity,
      dateSimilarity: avgSimilarity,
      merchantSimilarity: avgSimilarity,
      contextSimilarity: avgSimilarity,
      overallSimilarity: avgSimilarity,
      duplicateType,
      confidence: avgConfidence,
      reason: Array.from(allReasons)
    };
  }

  /**
   * Normalize merchant name for better matching
   */
  private normalizeMerchantName(merchant: string): string {
    return merchant
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .replace(/\b(pvt|ltd|llc|inc|corp|co|restaurant|cafe|store|shop)\b/g, '') // Remove common suffixes
      .trim();
  }

  /**
   * Calculate string similarity using Jaro-Winkler distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Simple implementation - in production, use a proper Jaro-Winkler algorithm
    const longer = str1.length > str2.length ? str1 : str2;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(str1, str2);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Check for known merchant name variations
   */
  private checkMerchantVariations(merchant1: string, merchant2: string): number {
    const variations = new Map([
      ['mcdonalds', ['mcd', 'mc donalds', 'mac donalds']],
      ['starbucks', ['starbucks coffee', 'sbux']],
      ['amazon', ['amazon.com', 'amzn']],
      ['zomato', ['zomato limited', 'zom']],
      ['swiggy', ['swiggy limited', 'swiggy food']],
      // Add more variations as needed
    ]);
    
    for (const [canonical, aliases] of variations) {
      const isFirst = merchant1 === canonical || aliases.includes(merchant1);
      const isSecond = merchant2 === canonical || aliases.includes(merchant2);
      
      if (isFirst && isSecond) return 0.9;
    }
    
    return 0;
  }

  /**
   * Calculate pair similarity (simplified synchronous version)
   */
  private calculatePairSimilarity(
    transaction1: ExtractedTransactionData,
    transaction2: ExtractedTransactionData
  ): DuplicateAnalysis {
    // Simplified version for group analysis
    const amountSim = this.calculateAmountSimilarity(transaction1.amount, transaction2.amount);
    const dateSim = this.calculateDateSimilarity(transaction1.date, transaction2.date);
    
    // Simplified synchronous merchant similarity
    const merchantSim = this.calculateMerchantSimilaritySync(transaction1.merchant, transaction2.merchant);
    const contextSim = this.calculateContextSimilarity(transaction1, transaction2);
    
    const overall = (amountSim + dateSim + merchantSim + contextSim) / 4;
    
    let duplicateType: 'exact' | 'similar' | 'potential';
    if (overall > 0.9) {
      duplicateType = 'exact';
    } else if (overall > 0.7) {
      duplicateType = 'similar';
    } else {
      duplicateType = 'potential';
    }
    
    return {
      amountSimilarity: amountSim,
      dateSimilarity: dateSim,
      merchantSimilarity: merchantSim,
      contextSimilarity: contextSim,
      overallSimilarity: overall,
      duplicateType,
      confidence: overall,
      reason: ['Simplified analysis']
    };
  }

  /**
   * Synchronous version of merchant similarity calculation
   */
  private calculateMerchantSimilaritySync(
    merchant1: string | undefined,
    merchant2: string | undefined
  ): number {
    if (!merchant1 || !merchant2) return 0;
    
    // Exact match (case insensitive)
    if (merchant1.toLowerCase() === merchant2.toLowerCase()) return 1.0;
    
    // Normalize merchant names
    const normalized1 = this.normalizeMerchantName(merchant1);
    const normalized2 = this.normalizeMerchantName(merchant2);
    
    if (normalized1 === normalized2) return 0.95;
    
    // Fuzzy string matching
    const similarity = this.calculateStringSimilarity(normalized1, normalized2);
    
    // Check for common merchant variations
    const variationSimilarity = this.checkMerchantVariations(normalized1, normalized2);
    
    return Math.max(similarity, variationSimilarity);
  }

  /**
   * Generate unique group ID
   */
  private generateGroupId(): string {
    return `dup_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export default DuplicateDetectionEngine;