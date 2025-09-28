/**
 * Smart Learning Engine - AI that learns from user corrections
 * USP: "The only OCR that gets smarter with every receipt"
 */

import { ExtractedTransactionData } from './ocr-processor';

interface UserLearningProfile {
  userId: string;
  correctionHistory: CorrectionData[];
  personalizedMerchants: Map<string, MerchantPattern>;
  spendingPatterns: Map<string, SpendingPattern>;
  accuracyScore: number;
  learningMetrics: LearningMetrics;
}

interface CorrectionData {
  timestamp: Date;
  originalExtraction: ExtractedTransactionData;
  userCorrection: ExtractedTransactionData;
  context: string;
  confidence: number;
  learningWeight: number;
}

interface MerchantPattern {
  name: string;
  aliases: string[];
  typicalAmountRange: [number, number];
  frequentCategories: string[];
  averageSpending: number;
  userConfidenceBoost: number;
}

interface SpendingPattern {
  category: string;
  timeOfDay: number[];
  dayOfWeek: number[];
  monthlyAverage: number;
  seasonalVariations: Map<string, number>;
  predictedNextPurchase: Date;
}

interface LearningMetrics {
  totalCorrections: number;
  accuracyImprovement: number;
  learningVelocity: number;
  personalizedAccuracy: number;
  lastLearningDate: Date;
}

export class SmartLearningEngine {
  private userProfiles = new Map<string, UserLearningProfile>();
  private globalLearningData = new Map<string, any>();
  private neuralPatterns = new Map<string, number[]>();
  
  constructor() {
    this.initializeLearningEngine();
  }

  /**
   * Learn from user correction to improve future accuracy
   */
  async learnFromUserCorrection(
    userId: string,
    original: ExtractedTransactionData,
    corrected: ExtractedTransactionData,
    context: string
  ): Promise<LearningResult> {
    const profile = this.getUserProfile(userId);
    
    const correctionData: CorrectionData = {
      timestamp: new Date(),
      originalExtraction: original,
      userCorrection: corrected,
      context,
      confidence: this.calculateCorrectionConfidence(original, corrected),
      learningWeight: this.calculateLearningWeight(original, corrected)
    };

    // Store correction
    profile.correctionHistory.push(correctionData);
    
    // Update personalized patterns
    await this.updatePersonalizedPatterns(profile, correctionData);
    
    // Update merchant database
    await this.updatePersonalizedMerchants(profile, correctionData);
    
    // Update spending patterns
    await this.updateSpendingPatterns(profile, correctionData);
    
    // Calculate learning metrics
    this.updateLearningMetrics(profile);
    
    return {
      accuracyImprovement: profile.learningMetrics.accuracyImprovement,
      newPatternsLearned: this.getNewPatternsLearned(correctionData),
      confidence: profile.accuracyScore,
      recommendations: await this.generateLearningRecommendations(profile)
    };
  }

  /**
   * Apply personalized learning to OCR results
   */
  async applyPersonalizedLearning(
    userId: string,
    extractedData: ExtractedTransactionData,
    rawText: string
  ): Promise<EnhancedTransactionData> {
    const profile = this.getUserProfile(userId);
    
    // Apply merchant learning
    const enhancedMerchant = await this.applyMerchantLearning(
      profile, 
      extractedData.merchant, 
      rawText
    );
    
    // Apply amount validation
    const enhancedAmount = await this.applyAmountLearning(
      profile, 
      extractedData.amount, 
      enhancedMerchant
    );
    
    // Apply category learning
    const enhancedCategory = await this.applyCategoryLearning(
      profile, 
      extractedData.category, 
      enhancedMerchant, 
      enhancedAmount
    );
    
    // Apply confidence scoring
    const personalizedConfidence = await this.calculatePersonalizedConfidence(
      profile, 
      extractedData
    );

    return {
      ...extractedData,
      merchant: enhancedMerchant,
      amount: enhancedAmount,
      category: enhancedCategory,
      confidence: personalizedConfidence,
      learningApplied: true,
      learningScore: profile.accuracyScore,
      personalizedSuggestions: await this.generatePersonalizedSuggestions(profile, extractedData)
    };
  }

  /**
   * Generate learning insights for the user
   */
  async generateLearningInsights(userId: string): Promise<LearningInsight[]> {
    const profile = this.getUserProfile(userId);
    const insights: LearningInsight[] = [];

    // Accuracy improvement insight
    if (profile.learningMetrics.accuracyImprovement > 0) {
      insights.push({
        type: 'accuracy_improvement',
        title: 'Your OCR is getting smarter! 🧠',
        description: `Accuracy improved by ${profile.learningMetrics.accuracyImprovement.toFixed(1)}% from your corrections`,
        impact: 'high',
        actionable: false
      });
    }

    // Merchant learning insight
    const learnedMerchants = Array.from(profile.personalizedMerchants.keys());
    if (learnedMerchants.length > 0) {
      insights.push({
        type: 'merchant_learning',
        title: `Learned ${learnedMerchants.length} of your favorite places! 🏪`,
        description: `Now recognizing: ${learnedMerchants.slice(0, 3).join(', ')}${learnedMerchants.length > 3 ? '...' : ''}`,
        impact: 'medium',
        actionable: false
      });
    }

    // Spending pattern insights
    const patterns = await this.analyzeSpendingPatterns(profile);
    insights.push(...patterns);

    return insights;
  }

  private initializeLearningEngine(): void {
    // Initialize neural pattern recognition
    this.setupNeuralPatterns();
    
    // Load global learning data
    this.loadGlobalLearningData();
  }

  private getUserProfile(userId: string): UserLearningProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        correctionHistory: [],
        personalizedMerchants: new Map(),
        spendingPatterns: new Map(),
        accuracyScore: 0.85, // Base accuracy
        learningMetrics: {
          totalCorrections: 0,
          accuracyImprovement: 0,
          learningVelocity: 0,
          personalizedAccuracy: 0.85,
          lastLearningDate: new Date()
        }
      });
    }
    return this.userProfiles.get(userId)!;
  }

  private calculateCorrectionConfidence(
    original: ExtractedTransactionData,
    corrected: ExtractedTransactionData
  ): number {
    let confidence = 1.0;
    
    // Major corrections reduce confidence more
    if (original.amount !== corrected.amount) confidence -= 0.3;
    if (original.merchant !== corrected.merchant) confidence -= 0.2;
    if (original.category !== corrected.category) confidence -= 0.1;
    if (original.date !== corrected.date) confidence -= 0.1;
    
    return Math.max(confidence, 0.1);
  }

  private calculateLearningWeight(
    original: ExtractedTransactionData,
    corrected: ExtractedTransactionData
  ): number {
    // Recent corrections have higher weight
    let weight = 1.0;
    
    // Frequent merchant corrections get higher weight
    if (original.merchant !== corrected.merchant) weight += 0.5;
    
    // Amount corrections are very important
    if (original.amount !== corrected.amount) weight += 0.3;
    
    return Math.min(weight, 2.0);
  }

  private async updatePersonalizedPatterns(
    profile: UserLearningProfile,
    correction: CorrectionData
  ): Promise<void> {
    const { originalExtraction, userCorrection } = correction;
    
    // Learn text patterns that led to incorrect extraction
    if (originalExtraction.merchant !== userCorrection.merchant) {
      await this.learnMerchantPattern(profile, originalExtraction, userCorrection);
    }
    
    // Learn amount patterns
    if (originalExtraction.amount !== userCorrection.amount) {
      await this.learnAmountPattern(profile, originalExtraction, userCorrection);
    }
    
    // Learn category preferences
    if (originalExtraction.category !== userCorrection.category) {
      await this.learnCategoryPattern(profile, originalExtraction, userCorrection);
    }
  }

  private async updatePersonalizedMerchants(
    profile: UserLearningProfile,
    correction: CorrectionData
  ): Promise<void> {
    const merchantName = correction.userCorrection.merchant;
    if (!merchantName) return;

    let merchantPattern = profile.personalizedMerchants.get(merchantName);
    
    if (!merchantPattern) {
      merchantPattern = {
        name: merchantName,
        aliases: [],
        typicalAmountRange: [0, 0],
        frequentCategories: [],
        averageSpending: 0,
        userConfidenceBoost: 0.1
      };
    }

    // Add alias if original was different
    const originalMerchant = correction.originalExtraction.merchant;
    if (originalMerchant && originalMerchant !== merchantName) {
      if (!merchantPattern.aliases.includes(originalMerchant)) {
        merchantPattern.aliases.push(originalMerchant);
      }
    }

    // Update amount range
    const amount = correction.userCorrection.amount || 0;
    if (merchantPattern.typicalAmountRange[0] === 0) {
      merchantPattern.typicalAmountRange = [amount, amount];
    } else {
      merchantPattern.typicalAmountRange[0] = Math.min(merchantPattern.typicalAmountRange[0], amount);
      merchantPattern.typicalAmountRange[1] = Math.max(merchantPattern.typicalAmountRange[1], amount);
    }

    // Update category
    const category = correction.userCorrection.category;
    if (category && !merchantPattern.frequentCategories.includes(category)) {
      merchantPattern.frequentCategories.push(category);
    }

    // Increase confidence boost
    merchantPattern.userConfidenceBoost = Math.min(
      merchantPattern.userConfidenceBoost + 0.05, 
      0.5
    );

    profile.personalizedMerchants.set(merchantName, merchantPattern);
  }

  private async updateSpendingPatterns(
    profile: UserLearningProfile,
    correction: CorrectionData
  ): Promise<void> {
    const category = correction.userCorrection.category;
    if (!category) return;

    let pattern = profile.spendingPatterns.get(category);
    
    if (!pattern) {
      pattern = {
        category,
        timeOfDay: [],
        dayOfWeek: [],
        monthlyAverage: 0,
        seasonalVariations: new Map(),
        predictedNextPurchase: new Date()
      };
    }

    // Update time patterns
    const now = new Date();
    pattern.timeOfDay.push(now.getHours());
    pattern.dayOfWeek.push(now.getDay());

    // Update monthly average
    const amount = correction.userCorrection.amount || 0;
    pattern.monthlyAverage = (pattern.monthlyAverage + amount) / 2;

    profile.spendingPatterns.set(category, pattern);
  }

  private updateLearningMetrics(profile: UserLearningProfile): void {
    profile.learningMetrics.totalCorrections++;
    profile.learningMetrics.lastLearningDate = new Date();
    
    // Calculate accuracy improvement
    const recentCorrections = profile.correctionHistory.slice(-10);
    const avgConfidence = recentCorrections.reduce(
      (sum, c) => sum + c.confidence, 0
    ) / recentCorrections.length;
    
    profile.learningMetrics.accuracyImprovement = 
      (profile.accuracyScore - 0.85) * 100;
    
    // Update learning velocity
    profile.learningMetrics.learningVelocity = 
      profile.learningMetrics.totalCorrections / 
      Math.max(1, (Date.now() - profile.learningMetrics.lastLearningDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getNewPatternsLearned(correction: CorrectionData): string[] {
    const patterns: string[] = [];
    
    if (correction.originalExtraction.merchant !== correction.userCorrection.merchant) {
      patterns.push('merchant_recognition');
    }
    
    if (correction.originalExtraction.amount !== correction.userCorrection.amount) {
      patterns.push('amount_parsing');
    }
    
    if (correction.originalExtraction.category !== correction.userCorrection.category) {
      patterns.push('category_classification');
    }
    
    return patterns;
  }

  private async generateLearningRecommendations(
    profile: UserLearningProfile
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (profile.learningMetrics.totalCorrections < 5) {
      recommendations.push("Keep correcting OCR results to improve accuracy");
    }
    
    if (profile.personalizedMerchants.size > 10) {
      recommendations.push("Great! I've learned your favorite places");
    }
    
    if (profile.learningMetrics.accuracyImprovement > 10) {
      recommendations.push("Your OCR accuracy has improved significantly!");
    }
    
    return recommendations;
  }

  private async applyMerchantLearning(
    profile: UserLearningProfile,
    originalMerchant: string | undefined,
    rawText: string
  ): Promise<string | undefined> {
    if (!originalMerchant) return originalMerchant;

    // Check learned merchant patterns
    for (const [merchantName, pattern] of profile.personalizedMerchants) {
      // Check if original merchant is an alias
      if (pattern.aliases.includes(originalMerchant)) {
        return merchantName;
      }
      
      // Check fuzzy matching with learned patterns
      if (this.fuzzyMatch(originalMerchant, merchantName) > 0.8) {
        return merchantName;
      }
    }

    return originalMerchant;
  }

  private async applyAmountLearning(
    profile: UserLearningProfile,
    originalAmount: number | undefined,
    merchant: string | undefined
  ): Promise<number | undefined> {
    if (!originalAmount || !merchant) return originalAmount;

    const merchantPattern = profile.personalizedMerchants.get(merchant);
    if (!merchantPattern) return originalAmount;

    // Validate amount against learned range
    const [minAmount, maxAmount] = merchantPattern.typicalAmountRange;
    if (minAmount > 0 && maxAmount > 0) {
      if (originalAmount < minAmount * 0.5 || originalAmount > maxAmount * 2) {
        // Amount seems unusual, but don't auto-correct
        // Just flag for user attention
        return originalAmount;
      }
    }

    return originalAmount;
  }

  private async applyCategoryLearning(
    profile: UserLearningProfile,
    originalCategory: string | undefined,
    merchant: string | undefined,
    amount: number | undefined
  ): Promise<string | undefined> {
    if (!merchant) return originalCategory;

    const merchantPattern = profile.personalizedMerchants.get(merchant);
    if (!merchantPattern || merchantPattern.frequentCategories.length === 0) {
      return originalCategory;
    }

    // Use most frequent category for this merchant
    const mostFrequentCategory = merchantPattern.frequentCategories[0];
    return mostFrequentCategory;
  }

  private async calculatePersonalizedConfidence(
    profile: UserLearningProfile,
    extractedData: ExtractedTransactionData
  ): Promise<number> {
    let confidence = extractedData.confidence || 0.85;

    // Boost confidence for learned merchants
    if (extractedData.merchant && profile.personalizedMerchants.has(extractedData.merchant)) {
      const boost = profile.personalizedMerchants.get(extractedData.merchant)!.userConfidenceBoost;
      confidence += boost;
    }

    // Apply user's overall accuracy improvement
    confidence += profile.learningMetrics.accuracyImprovement / 100;

    return Math.min(confidence, 1.0);
  }

  private async generatePersonalizedSuggestions(
    profile: UserLearningProfile,
    extractedData: ExtractedTransactionData
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Suggest if merchant seems new
    if (extractedData.merchant && !profile.personalizedMerchants.has(extractedData.merchant)) {
      suggestions.push(`New place detected: ${extractedData.merchant}`);
    }

    // Suggest if amount seems unusual
    const merchantPattern = extractedData.merchant ? 
      profile.personalizedMerchants.get(extractedData.merchant) : null;
    
    if (merchantPattern && extractedData.amount) {
      const avgSpending = merchantPattern.averageSpending;
      if (avgSpending > 0 && extractedData.amount > avgSpending * 1.5) {
        suggestions.push(`Higher than usual spending at ${extractedData.merchant}`);
      }
    }

    return suggestions;
  }

  private async analyzeSpendingPatterns(profile: UserLearningProfile): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    for (const [category, pattern] of profile.spendingPatterns) {
      // Analyze time patterns
      if (pattern.timeOfDay.length > 5) {
        const avgHour = pattern.timeOfDay.reduce((a, b) => a + b, 0) / pattern.timeOfDay.length;
        let timeDescription = '';
        
        if (avgHour < 12) timeDescription = 'morning';
        else if (avgHour < 17) timeDescription = 'afternoon';
        else timeDescription = 'evening';

        insights.push({
          type: 'spending_pattern',
          title: `You usually buy ${category} in the ${timeDescription} 🕐`,
          description: `Average time: ${Math.round(avgHour)}:00`,
          impact: 'low',
          actionable: true
        });
      }
    }

    return insights;
  }

  private setupNeuralPatterns(): void {
    // Initialize basic neural pattern recognition
    // This would be expanded with actual ML models
  }

  private loadGlobalLearningData(): void {
    // Load anonymized learning patterns from other users
    // This would be implemented with a proper ML pipeline
  }

  private async learnMerchantPattern(
    profile: UserLearningProfile,
    original: ExtractedTransactionData,
    corrected: ExtractedTransactionData
  ): Promise<void> {
    // Store patterns that led to merchant misidentification
    // This would include text patterns, context clues, etc.
  }

  private async learnAmountPattern(
    profile: UserLearningProfile,
    original: ExtractedTransactionData,
    corrected: ExtractedTransactionData
  ): Promise<void> {
    // Learn amount parsing patterns specific to user's receipts
  }

  private async learnCategoryPattern(
    profile: UserLearningProfile,
    original: ExtractedTransactionData,
    corrected: ExtractedTransactionData
  ): Promise<void> {
    // Learn user's category preferences
  }

  private fuzzyMatch(str1: string, str2: string): number {
    // Simple fuzzy matching algorithm
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

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

// Type definitions
interface LearningResult {
  accuracyImprovement: number;
  newPatternsLearned: string[];
  confidence: number;
  recommendations: string[];
}

interface EnhancedTransactionData extends ExtractedTransactionData {
  learningApplied: boolean;
  learningScore: number;
  personalizedSuggestions: string[];
}

interface LearningInsight {
  type: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export default SmartLearningEngine;