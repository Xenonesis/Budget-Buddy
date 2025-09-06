import { createWorker } from 'tesseract.js';
import { AIValidationEngine } from './ai-validation-engine';
import { INDIAN_PAYMENT_PATTERNS, detectPaymentPlatform, getMerchantCategory, AMOUNT_VALIDATION_RULES } from './real-ocr-patterns';

export interface ExtractedTransactionData {
  amount?: number;
  description?: string;
  date?: string;
  merchant?: string;
  category?: string;
  type?: 'income' | 'expense';
  confidence?: number;
  paymentMethod?: string;
  transactionId?: string;
  currency?: string;
  location?: string;
  rawText?: string;
}

export interface ProcessingResult {
  data: ExtractedTransactionData;
  confidence: number;
  processingMethod: string;
  validationResults: ValidationResult[];
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  correctedValue?: any;
}

export class AdvancedOCRProcessor {
  private tesseractWorker: any = null;
  private isInitialized = false;
  private processingCache = new Map<string, ProcessingResult>();
  private aiValidator = new AIValidationEngine();
  
  // Real-world patterns for Indian payment systems
  private getPatterns(paymentPlatform: string | null) {
    if (paymentPlatform && INDIAN_PAYMENT_PATTERNS[paymentPlatform as keyof typeof INDIAN_PAYMENT_PATTERNS]) {
      return INDIAN_PAYMENT_PATTERNS[paymentPlatform as keyof typeof INDIAN_PAYMENT_PATTERNS];
    }
    return INDIAN_PAYMENT_PATTERNS.general;
  }

  // Advanced merchant database with fuzzy matching
  private merchantDatabase = {
    'food': {
      keywords: ['zomato', 'swiggy', 'dominos', 'pizza', 'restaurant', 'cafe', 'food', 'kitchen', 'dine', 'eat', 'meal'],
      category: 'Food & Dining',
      type: 'expense'
    },
    'transport': {
      keywords: ['uber', 'ola', 'taxi', 'metro', 'bus', 'fuel', 'petrol', 'diesel', 'transport', 'travel'],
      category: 'Transportation',
      type: 'expense'
    },
    'shopping': {
      keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store', 'purchase', 'buy'],
      category: 'Shopping',
      type: 'expense'
    },
    'utilities': {
      keywords: ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bill', 'utility'],
      category: 'Utilities',
      type: 'expense'
    },
    'entertainment': {
      keywords: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'fun'],
      category: 'Entertainment',
      type: 'expense'
    },
    'healthcare': {
      keywords: ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'health', 'clinic'],
      category: 'Healthcare',
      type: 'expense'
    },
    'income': {
      keywords: ['salary', 'bonus', 'refund', 'cashback', 'credit', 'received', 'income', 'earning'],
      category: 'Income',
      type: 'income'
    }
  };

  async initialize() {
    if (!this.isInitialized) {
      try {
        // Create worker with explicit options to handle CSP
        this.tesseractWorker = await createWorker('eng', 1, {
          workerPath: 'https://unpkg.com/tesseract.js@5.0.4/dist/worker.min.js',
          langPath: 'https://tessdata.projectnaptha.com/4.0.0',
          corePath: 'https://unpkg.com/tesseract.js-core@5.0.0/tesseract-core-simd.wasm.js',
        });
        
        await this.tesseractWorker.setParameters({
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/-:₹ ',
          tessedit_pageseg_mode: '6', // Uniform block of text
        });
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize OCR worker:', error);
        throw new Error('OCR initialization failed');
      }
    }
  }

  async processDocument(file: File): Promise<ProcessingResult> {
    try {
      // Generate cache key
      const cacheKey = await this.generateFileHash(file);
      
      // Check cache first
      if (this.processingCache.has(cacheKey)) {
        return this.processingCache.get(cacheKey)!;
      }

      await this.initialize();
      
      let text = '';
      let processingMethod = '';

      // Multi-stage processing based on file type
      if (file.type === 'application/pdf') {
        text = await this.processPDFWithMultipleMethods(file);
        processingMethod = 'PDF Multi-Method';
      } else {
        text = await this.processImageWithEnhancement(file);
        processingMethod = 'Enhanced Image OCR';
      }

      // Apply intelligent text processing
      const processedText = this.preprocessText(text);
      
      // Extract data using multiple algorithms
      const extractedData = await this.extractDataIntelligently(processedText);
      
      // Validate and enhance data with AI
      const validationResults = await this.validateExtractedDataWithAI(extractedData, processedText, file, processingMethod);
      
      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(extractedData, validationResults);
      
      const result: ProcessingResult = {
        data: { ...extractedData, rawText: text },
        confidence,
        processingMethod,
        validationResults
      };

      // Cache the result
      this.processingCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Document processing failed:', error);
      throw new Error('Failed to process document');
    }
  }

  private async processPDFWithMultipleMethods(file: File): Promise<string> {
    // Method 1: Try direct text extraction
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = await this.extractTextFromPDF(arrayBuffer);
      if (text && text.length > 50) {
        return text;
      }
    } catch (error) {
      console.warn('Direct PDF text extraction failed:', error);
    }

    // Method 2: Convert to image and OCR
    try {
      const imageData = await this.convertPDFToImage(file);
      return await this.performOCR(imageData);
    } catch (error) {
      console.error('PDF to image conversion failed:', error);
      throw error;
    }
  }

  private async processImageWithEnhancement(file: File): Promise<string> {
    try {
      // Enhance image quality before OCR
      const enhancedImage = await this.enhanceImageQuality(file);
      return await this.performOCR(enhancedImage);
    } catch (error) {
      console.error('Image enhancement failed:', error);
      // Fallback to original image
      const originalData = await this.fileToDataURL(file);
      return await this.performOCR(originalData);
    }
  }

  private async enhanceImageQuality(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size with higher resolution
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Apply image enhancements
        ctx.imageSmoothingEnabled = false;
        ctx.scale(scale, scale);
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Apply filters for better OCR
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Increase contrast and brightness
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale and enhance contrast
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          const enhanced = gray > 128 ? 255 : 0; // Binarize
          
          data[i] = enhanced;     // Red
          data[i + 1] = enhanced; // Green
          data[i + 2] = enhanced; // Blue
          // Alpha remains the same
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async performOCR(imageData: string): Promise<string> {
    try {
      const { data: { text } } = await this.tesseractWorker.recognize(imageData);
      return text;
    } catch (error) {
      console.error('OCR failed:', error);
      throw error;
    }
  }

  private preprocessText(text: string): string {
    console.log('Raw OCR text:', text);
    
    const processed = text
      .replace(/[^\w\s₹.,/-:()[\]]/g, ' ') // Keep more characters that might be important
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('Processed OCR text:', processed);
    return processed;
  }

  private async extractDataIntelligently(text: string): Promise<ExtractedTransactionData> {
    const result: ExtractedTransactionData = {};
    
    // Detect payment platform first for context-aware extraction
    const paymentPlatform = detectPaymentPlatform(text);
    const patterns = this.getPatterns(paymentPlatform);
    
    // Extract amount with platform-specific patterns
    result.amount = this.extractAmountWithPatterns(text, patterns.amount || INDIAN_PAYMENT_PATTERNS.general.amount);
    
    // Extract date with format detection
    result.date = this.extractDateWithPatterns(text, (patterns as any).date || INDIAN_PAYMENT_PATTERNS.general.date);
    
    // Extract merchant with context analysis
    result.merchant = this.extractMerchantWithPatterns(text, (patterns as any).merchant || INDIAN_PAYMENT_PATTERNS.general.merchant);
    
    // Extract transaction ID
    result.transactionId = this.extractTransactionIdWithPatterns(text, (patterns as any).transactionId || []);
    
    // Determine transaction type and category using real merchant database
    const classification = this.classifyTransactionWithRealData(text, result.merchant);
    result.type = classification.type;
    result.category = classification.category;
    
    // Extract payment method
    result.paymentMethod = paymentPlatform || this.extractPaymentMethod(text);
    
    // Set currency
    result.currency = this.detectCurrency(text);
    
    return result;
  }

  private extractAmountWithPatterns(text: string, patterns: RegExp[]): number | undefined {
    const amounts: { value: number; confidence: number; context: string }[] = [];
    
    // Clean text for better pattern matching
    const cleanText = text
      .replace(/[^\w\s₹.,/-:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('OCR Text for amount extraction:', cleanText);
    
    for (const pattern of patterns) {
      const matches = cleanText.matchAll(pattern);
      for (const match of matches) {
        const amountStr = match[1].replace(/,/g, '').replace(/\s/g, '');
        const amount = parseFloat(amountStr);
        
        console.log(`Pattern matched: ${pattern.source}, Amount: ${amountStr} -> ${amount}`);
        
        // Use real validation rules
        if (!isNaN(amount) && 
            amount >= AMOUNT_VALIDATION_RULES.minAmount && 
            amount <= AMOUNT_VALIDATION_RULES.maxAmount) {
          
          // Check for suspicious patterns
          const isSuspicious = AMOUNT_VALIDATION_RULES.suspiciousPatterns.some(
            suspiciousPattern => suspiciousPattern.test(amountStr)
          );
          
          if (!isSuspicious) {
            // Calculate confidence based on context
            let confidence = 0.5;
            const context = match[0].toLowerCase();
            
            // Higher confidence for explicit amount keywords
            if (context.includes('total') || context.includes('amount') || context.includes('bill')) {
              confidence += 0.3;
            }
            
            // Higher confidence for currency symbols
            if (context.includes('₹') || context.includes('rs')) {
              confidence += 0.2;
            }
            
            // Higher confidence for reasonable amounts
            if (amount >= 10 && amount <= 10000) {
              confidence += 0.1;
            }
            
            amounts.push({ value: amount, confidence, context });
          }
        }
      }
    }
    
    console.log('All extracted amounts:', amounts);
    
    if (amounts.length === 0) {
      // Fallback: try to find any number that looks like an amount
      const fallbackPattern = /(\d{1,6}(?:\.\d{2})?)/g;
      const fallbackMatches = cleanText.matchAll(fallbackPattern);
      
      for (const match of fallbackMatches) {
        const amount = parseFloat(match[1]);
        if (amount >= 10 && amount <= 100000) {
          amounts.push({ value: amount, confidence: 0.3, context: 'fallback' });
        }
      }
      
      console.log('Fallback amounts:', amounts);
    }
    
    if (amounts.length === 0) return undefined;
    if (amounts.length === 1) return amounts[0].value;
    
    // Sort by confidence and return the highest confidence amount
    amounts.sort((a, b) => b.confidence - a.confidence);
    
    // If top amounts have similar confidence, prefer larger amounts (likely to be totals)
    const topAmounts = amounts.filter(a => a.confidence >= amounts[0].confidence - 0.1);
    if (topAmounts.length > 1) {
      topAmounts.sort((a, b) => b.value - a.value);
    }
    
    console.log('Selected amount:', topAmounts[0]);
    return topAmounts[0].value;
  }

  private extractDateWithPatterns(text: string, patterns: RegExp[]): string | undefined {
    const dates: string[] = [];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const dateStr = match[1];
        const parsedDate = this.parseDate(dateStr);
        if (parsedDate) {
          dates.push(parsedDate);
        }
      }
    }
    
    if (dates.length === 0) return undefined;
    
    // Return the most recent valid date within reasonable range
    const validDates = dates
      .map(dateStr => new Date(dateStr))
      .filter(date => {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const oneMonthFuture = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return date >= oneYearAgo && date <= oneMonthFuture;
      })
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first
    
    return validDates.length > 0 ? validDates[0].toISOString().split('T')[0] : undefined;
  }

  private parseDate(dateStr: string): string | null {
    try {
      // Handle various date formats
      const formats = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/, // DD/MM/YYYY or DD-MM-YYYY
        /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        /(\d{1,2})\s+(\w+)\s+(\d{4})/ // DD MMM YYYY
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          if (format === formats[0]) { // DD/MM/YYYY
            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            let year = parseInt(match[3]);
            if (year < 100) year += 2000; // Handle 2-digit years
            return new Date(year, month - 1, day).toISOString().split('T')[0];
          } else if (format === formats[1]) { // YYYY-MM-DD
            return dateStr;
          } else if (format === formats[2]) { // DD MMM YYYY
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          }
        }
      }
      
      // Fallback to Date constructor
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Date parsing failed for:', dateStr);
    }
    
    return null;
  }

  private extractMerchantWithPatterns(text: string, patterns: RegExp[]): string | undefined {
    const merchants: string[] = [];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const merchant = match[1].trim();
        if (merchant.length > 2 && merchant.length < 100) {
          merchants.push(merchant);
        }
      }
    }
    
    if (merchants.length === 0) return undefined;
    
    // Clean and validate merchants
    const cleanMerchants = merchants
      .map(m => m.replace(/[^a-zA-Z\s&.-]/g, '').trim())
      .filter(m => m.length > 2)
      .filter(m => !this.isCommonWord(m));
    
    return cleanMerchants.length > 0 ? cleanMerchants[0] : undefined;
  }

  private extractTransactionIdWithPatterns(text: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].length >= 6) {
        return match[1];
      }
    }
    
    // Fallback to general transaction ID patterns from real-ocr-patterns
    const { TRANSACTION_ID_PATTERNS } = require('./real-ocr-patterns');
    for (const pattern of TRANSACTION_ID_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[0].length >= 6) {
        return match[0];
      }
    }
    
    return undefined;
  }

  private classifyTransactionWithRealData(text: string, merchant?: string): { type: 'income' | 'expense', category: string } {
    // First try to classify based on merchant name
    if (merchant) {
      const merchantCategory = getMerchantCategory(merchant);
      if (merchantCategory) {
        return merchantCategory;
      }
    }
    
    // Fallback to text analysis
    const textLower = text.toLowerCase();
    
    // Check for income indicators
    const incomeKeywords = ['salary', 'bonus', 'refund', 'cashback', 'credit', 'received', 'income', 'earning', 'dividend', 'interest'];
    const hasIncomeKeywords = incomeKeywords.some(keyword => textLower.includes(keyword));
    
    if (hasIncomeKeywords) {
      return { type: 'income', category: 'Income' };
    }
    
    // Check for specific expense categories
    const categoryKeywords = {
      'Food & Dining': ['food', 'restaurant', 'cafe', 'dining', 'meal', 'eat', 'zomato', 'swiggy', 'dominos'],
      'Transportation': ['taxi', 'uber', 'ola', 'fuel', 'petrol', 'diesel', 'metro', 'bus', 'train', 'flight'],
      'Shopping': ['shopping', 'amazon', 'flipkart', 'myntra', 'store', 'mall', 'purchase'],
      'Utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bill'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'entertainment', 'bookmyshow'],
      'Healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'health'],
      'Groceries': ['grocery', 'vegetables', 'fruits', 'supermarket', 'bigbasket', 'grofers']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (textLower.includes(keyword) ? keyword.length : 0);
      }, 0);
      
      if (score > 0) {
        return { type: 'expense', category };
      }
    }
    
    return { type: 'expense', category: 'Other' };
  }

  private extractPaymentMethod(text: string): string | undefined {
    const methods = ['paytm', 'razorpay', 'upi', 'card', 'cash', 'net banking', 'wallet'];
    
    for (const method of methods) {
      if (text.includes(method)) {
        return method.charAt(0).toUpperCase() + method.slice(1);
      }
    }
    
    return undefined;
  }

  private detectCurrency(text: string): string {
    if (text.includes('₹') || text.includes('rs') || text.includes('inr')) {
      return 'INR';
    }
    if (text.includes('$') || text.includes('usd')) {
      return 'USD';
    }
    if (text.includes('€') || text.includes('eur')) {
      return 'EUR';
    }
    return 'INR'; // Default to INR
  }

  private async validateExtractedDataWithAI(
    data: ExtractedTransactionData, 
    text: string, 
    file: File, 
    processingMethod: string
  ): Promise<ValidationResult[]> {
    const context = {
      extractedText: text,
      fileType: file.type,
      fileName: file.name,
      processingMethod
    };
    
    // Use AI validation engine
    const aiResults = await this.aiValidator.validateWithAI(data, context);
    
    // Combine with traditional validation for backup
    const traditionalResults = await this.validateExtractedDataTraditional(data, text);
    
    // Convert AI results to our ValidationResult format
    const convertedAIResults: ValidationResult[] = aiResults.map(result => ({
      field: (result as any).field || 'unknown',
      isValid: result.isValid,
      confidence: result.confidence,
      suggestions: result.suggestions || [],
      correctedValue: result.correctedValue
    }));
    
    // Merge results, preferring AI validation
    const mergedResults = [...convertedAIResults];
    
    // Add traditional results for fields not covered by AI
    for (const traditional of traditionalResults) {
      const hasAIResult = convertedAIResults.some(ai => ai.field === traditional.field);
      if (!hasAIResult) {
        mergedResults.push(traditional);
      }
    }
    
    return mergedResults;
  }

  private async validateExtractedDataTraditional(data: ExtractedTransactionData, text: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Validate amount
    if (data.amount) {
      const amountValidation = this.validateAmount(data.amount, text);
      results.push(amountValidation);
    }
    
    // Validate date
    if (data.date) {
      const dateValidation = this.validateDate(data.date);
      results.push(dateValidation);
    }
    
    // Validate merchant
    if (data.merchant) {
      const merchantValidation = this.validateMerchant(data.merchant, text);
      results.push(merchantValidation);
    }
    
    return results;
  }

  private validateAmount(amount: number, text: string): ValidationResult {
    let confidence = 0.5;
    const suggestions: string[] = [];
    
    // Check if amount appears multiple times in text
    const amountStr = amount.toString();
    const occurrences = (text.match(new RegExp(amountStr.replace('.', '\\.'), 'g')) || []).length;
    confidence += Math.min(occurrences * 0.2, 0.4);
    
    // Check if amount is in reasonable range
    if (amount >= 1 && amount <= 100000) {
      confidence += 0.3;
    } else if (amount > 100000) {
      suggestions.push('Large amount detected - please verify');
    }
    
    return {
      field: 'amount',
      isValid: amount > 0,
      confidence: Math.min(confidence, 1),
      suggestions: suggestions || []
    };
  }

  private validateDate(dateStr: string): ValidationResult {
    const date = new Date(dateStr);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    const isValid = !isNaN(date.getTime()) && date >= oneYearAgo && date <= now;
    const confidence = isValid ? 0.9 : 0.1;
    
    return {
      field: 'date',
      isValid,
      confidence,
      suggestions: isValid ? [] : ['Date seems invalid - please check']
    };
  }

  private validateMerchant(merchant: string, text: string): ValidationResult {
    let confidence = 0.5;
    
    // Check if merchant name appears in known database
    for (const data of Object.values(this.merchantDatabase)) {
      if (data.keywords.some(keyword => merchant.toLowerCase().includes(keyword))) {
        confidence += 0.3;
        break;
      }
    }
    
    // Check merchant name quality
    if (merchant.length >= 3 && merchant.length <= 50) {
      confidence += 0.2;
    }
    
    return {
      field: 'merchant',
      isValid: merchant.length >= 2,
      confidence: Math.min(confidence, 1),
      suggestions: []
    };
  }

  private calculateOverallConfidence(data: ExtractedTransactionData, validations: ValidationResult[]): number {
    if (validations.length === 0) return 0.5;
    
    // Use AI validation engine's sophisticated confidence calculation
    const aiConfidence = this.aiValidator.calculateOverallConfidence(validations);
    
    // Bonus for having multiple fields extracted
    const fieldsExtracted = Object.values(data).filter(v => v !== undefined).length;
    const fieldBonus = Math.min(fieldsExtracted * 0.05, 0.15);
    
    // Bonus for high-quality extractions
    const qualityBonus = this.calculateQualityBonus(data, validations);
    
    return Math.min(aiConfidence + fieldBonus + qualityBonus, 1);
  }

  private calculateQualityBonus(data: ExtractedTransactionData, validations: ValidationResult[]): number {
    let bonus = 0;
    
    // Bonus for transaction ID (indicates high-quality source)
    if (data.transactionId && data.transactionId.length >= 8) {
      bonus += 0.1;
    }
    
    // Bonus for payment method detection
    if (data.paymentMethod) {
      bonus += 0.05;
    }
    
    // Bonus for currency detection
    if (data.currency) {
      bonus += 0.05;
    }
    
    // Bonus for high validation scores
    const highConfidenceValidations = validations.filter(v => v.confidence > 0.8).length;
    bonus += Math.min(highConfidenceValidations * 0.02, 0.1);
    
    return bonus;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return commonWords.includes(word.toLowerCase());
  }

  private async generateFileHash(file: File): Promise<string> {
    try {
      // Try using crypto.subtle if available (HTTPS context)
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (error) {
      console.warn('crypto.subtle not available, using fallback hash');
    }
    
    // Fallback: simple hash based on file properties
    const fileInfo = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    let hash = 0;
    for (let i = 0; i < fileInfo.length; i++) {
      const char = fileInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // Use PDF.js for browser-compatible PDF text extraction
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async convertPDFToImage(file: File): Promise<string> {
    try {
      // Convert PDF first page to image using PDF.js
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Get first page
      
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('PDF to image conversion failed:', error);
      // Fallback to text extraction and canvas rendering
      try {
        const text = await this.extractTextFromPDF(await file.arrayBuffer());
        if (text && text.length > 50) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = 800;
          canvas.height = 600;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'black';
          ctx.font = '16px Arial';
          
          const lines = text.split('\n');
          lines.forEach((line, index) => {
            ctx.fillText(line.substring(0, 80), 20, 30 + (index * 20));
          });
          
          return canvas.toDataURL('image/png');
        }
      } catch (fallbackError) {
        console.error('Fallback PDF processing failed:', fallbackError);
      }
      throw error;
    }
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
      this.isInitialized = false;
    }
    this.processingCache.clear();
  }
}