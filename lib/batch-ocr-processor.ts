/**
 * Batch OCR Processor - Process multiple documents simultaneously
 * USP: "Upload 50 receipts at once - get instant expense reports with duplicate detection"
 */

import { ExtractedTransactionData } from './ocr-processor';
import { DuplicateDetectionEngine } from './duplicate-detection-engine';
import { ExpenseReportGenerator } from './expense-report-generator';

interface BatchProcessingConfig {
  maxFiles: number;
  enableDuplicateDetection: boolean;
  enableCrossDocumentValidation: boolean;
  generateExpenseReport: boolean;
  processingMode: 'parallel' | 'sequential';
  batchId: string;
}

interface BatchProcessingResult {
  batchId: string;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  processingTime: number;
  duplicatesFound: DuplicateGroup[];
  extractedTransactions: ExtractedTransactionData[];
  expenseReport?: ExpenseReport;
  batchSummary: BatchSummary;
}

interface DuplicateGroup {
  id: string;
  transactions: ExtractedTransactionData[];
  similarity: number;
  duplicateType: 'exact' | 'similar' | 'potential';
  confidence: number;
  reason: string;
}

interface ExpenseReport {
  reportId: string;
  dateRange: [Date, Date];
  totalAmount: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  merchantSummary: MerchantSummary[];
  dailySummary: DailySummary[];
  insights: ReportInsight[];
}

interface BatchSummary {
  averageConfidence: number;
  topMerchants: string[];
  topCategories: string[];
  dateRange: [Date, Date];
  totalSpending: number;
  anomalies: AnomalyDetection[];
}

export class BatchOCRProcessor {
  private processingQueue: Map<string, BatchProcessingState> = new Map();
  private duplicateDetector: DuplicateDetectionEngine;
  private expenseReportGenerator: ExpenseReportGenerator;
  
  constructor() {
    this.duplicateDetector = new DuplicateDetectionEngine();
    this.expenseReportGenerator = new ExpenseReportGenerator();
  }

  /**
   * Process multiple files in batch
   */
  async processBatch(
    files: File[],
    config: BatchProcessingConfig,
    onProgress?: (progress: BatchProgress) => void
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    
    // Validate batch
    this.validateBatch(files, config);
    
    // Initialize batch state
    const batchState = this.initializeBatchState(config, files.length);
    this.processingQueue.set(config.batchId, batchState);
    
    try {
      // Process files
      const results = await this.processFiles(files, config, onProgress);
      
      // Detect duplicates
      let duplicates: DuplicateGroup[] = [];
      if (config.enableDuplicateDetection) {
        duplicates = await this.duplicateDetector.detectDuplicates(results);
      }
      
      // Cross-document validation
      if (config.enableCrossDocumentValidation) {
        await this.performCrossDocumentValidation(results);
      }
      
      // Generate expense report
      let expenseReport: ExpenseReport | undefined;
      if (config.generateExpenseReport) {
        expenseReport = await this.expenseReportGenerator.generateReport(results);
      }
      
      // Create batch summary
      const batchSummary = this.generateBatchSummary(results);
      
      const processingTime = Date.now() - startTime;
      
      return {
        batchId: config.batchId,
        totalFiles: files.length,
        successfulFiles: results.length,
        failedFiles: files.length - results.length,
        processingTime,
        duplicatesFound: duplicates,
        extractedTransactions: results,
        expenseReport,
        batchSummary
      };
      
    } finally {
      this.processingQueue.delete(config.batchId);
    }
  }

  /**
   * Process files with progress tracking
   */
  private async processFiles(
    files: File[],
    config: BatchProcessingConfig,
    onProgress?: (progress: BatchProgress) => void
  ): Promise<ExtractedTransactionData[]> {
    const results: ExtractedTransactionData[] = [];
    const batchState = this.processingQueue.get(config.batchId)!;
    
    if (config.processingMode === 'parallel') {
      // Process files in parallel (batches of 5 to avoid overwhelming browser)
      const batchSize = 5;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchPromises = batch.map(async (file, index) => {
          try {
            const result = await this.processSingleFile(file, i + index, config);
            batchState.completedFiles++;
            
            if (onProgress) {
              onProgress({
                completed: batchState.completedFiles,
                total: files.length,
                currentFile: file.name,
                stage: 'processing'
              });
            }
            
            return result;
          } catch (error) {
            batchState.failedFiles++;
            console.error(`Failed to process file ${file.name}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(r => r !== null) as ExtractedTransactionData[]);
      }
    } else {
      // Sequential processing
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await this.processSingleFile(files[i], i, config);
          results.push(result);
          batchState.completedFiles++;
          
          if (onProgress) {
            onProgress({
              completed: i + 1,
              total: files.length,
              currentFile: files[i].name,
              stage: 'processing'
            });
          }
        } catch (error) {
          batchState.failedFiles++;
          console.error(`Failed to process file ${files[i].name}:`, error);
        }
      }
    }
    
    return results;
  }

  /**
   * Process a single file within batch context
   */
  private async processSingleFile(
    file: File,
    index: number,
    config: BatchProcessingConfig
  ): Promise<ExtractedTransactionData> {
    // Use the enhanced OCR processor
    const ocrProcessor = new (await import('./llm-enhanced-ocr')).LLMEnhancedOCR();
    
    const result = await ocrProcessor.processDocument(file);
    
    // Add batch-specific metadata
    return {
      ...result,
      batchId: config.batchId,
      batchIndex: index,
      fileName: file.name,
      fileSize: file.size,
      processingTimestamp: new Date().toISOString()
    } as ExtractedTransactionData;
  }

  /**
   * Validate batch before processing
   */
  private validateBatch(files: File[], config: BatchProcessingConfig): void {
    if (files.length === 0) {
      throw new Error('No files provided for batch processing');
    }
    
    if (files.length > config.maxFiles) {
      throw new Error(`Too many files. Maximum allowed: ${config.maxFiles}`);
    }
    
    // Check file sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size: 10MB`);
      }
    }
    
    // Check file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} has unsupported type: ${file.type}`);
      }
    }
  }

  /**
   * Initialize batch processing state
   */
  private initializeBatchState(config: BatchProcessingConfig, totalFiles: number): BatchProcessingState {
    return {
      batchId: config.batchId,
      startTime: Date.now(),
      totalFiles,
      completedFiles: 0,
      failedFiles: 0,
      stage: 'initializing'
    };
  }

  /**
   * Perform cross-document validation
   */
  private async performCrossDocumentValidation(
    transactions: ExtractedTransactionData[]
  ): Promise<void> {
    // Validate date consistency
    this.validateDateConsistency(transactions);
    
    // Validate amount patterns
    this.validateAmountPatterns(transactions);
    
    // Validate merchant consistency
    this.validateMerchantConsistency(transactions);
  }

  /**
   * Generate batch processing summary
   */
  private generateBatchSummary(transactions: ExtractedTransactionData[]): BatchSummary {
    const confidences = transactions.map(t => t.confidence || 0);
    const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    
    const merchantCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    let totalSpending = 0;
    let minDate = new Date();
    let maxDate = new Date(0);
    
    for (const transaction of transactions) {
      // Count merchants
      if (transaction.merchant) {
        merchantCounts.set(
          transaction.merchant,
          (merchantCounts.get(transaction.merchant) || 0) + 1
        );
      }
      
      // Count categories
      if (transaction.category) {
        categoryCounts.set(
          transaction.category,
          (categoryCounts.get(transaction.category) || 0) + 1
        );
      }
      
      // Sum amounts
      if (transaction.amount) {
        totalSpending += transaction.amount;
      }
      
      // Track date range
      if (transaction.date) {
        const date = new Date(transaction.date);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
      }
    }
    
    const topMerchants = Array.from(merchantCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([merchant]) => merchant);
    
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
    
    return {
      averageConfidence,
      topMerchants,
      topCategories,
      dateRange: [minDate, maxDate],
      totalSpending,
      anomalies: this.detectAnomalies(transactions)
    };
  }

  private validateDateConsistency(transactions: ExtractedTransactionData[]): void {
    // Implementation for date validation across documents
  }

  private validateAmountPatterns(transactions: ExtractedTransactionData[]): void {
    // Implementation for amount pattern validation
  }

  private validateMerchantConsistency(transactions: ExtractedTransactionData[]): void {
    // Implementation for merchant name consistency
  }

  private detectAnomalies(transactions: ExtractedTransactionData[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Detect unusually high amounts
    const amounts = transactions.map(t => t.amount || 0).filter(a => a > 0);
    if (amounts.length > 0) {
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const threshold = avgAmount * 3;
      
      for (const transaction of transactions) {
        if (transaction.amount && transaction.amount > threshold) {
          anomalies.push({
            type: 'high_amount',
            transaction,
            description: `Amount ${transaction.amount} is ${(transaction.amount / avgAmount).toFixed(1)}x higher than average`,
            severity: 'medium'
          });
        }
      }
    }
    
    return anomalies;
  }

  /**
   * Get batch processing status
   */
  getBatchStatus(batchId: string): BatchProcessingState | null {
    return this.processingQueue.get(batchId) || null;
  }

  /**
   * Cancel batch processing
   */
  cancelBatch(batchId: string): boolean {
    if (this.processingQueue.has(batchId)) {
      this.processingQueue.delete(batchId);
      return true;
    }
    return false;
  }
}

// Supporting interfaces
interface BatchProcessingState {
  batchId: string;
  startTime: number;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  stage: 'initializing' | 'processing' | 'duplicates' | 'validation' | 'reporting' | 'complete';
}

interface BatchProgress {
  completed: number;
  total: number;
  currentFile: string;
  stage: string;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MerchantSummary {
  merchant: string;
  amount: number;
  count: number;
  averageTransaction: number;
}

interface DailySummary {
  date: string;
  amount: number;
  count: number;
  topCategory: string;
}

interface ReportInsight {
  type: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

interface AnomalyDetection {
  type: string;
  transaction: ExtractedTransactionData;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export default BatchOCRProcessor;