/**
 * Global OCR Engine - Multi-language and multi-currency OCR processing
 * USP: "Travel anywhere - scan any receipt in any language, auto-convert to INR"
 */

import { ExtractedTransactionData } from './ocr-processor';

interface GlobalOCRConfig {
  defaultCurrency: string;
  defaultLanguage: string;
  enableAutoLanguageDetection: boolean;
  enableCurrencyConversion: boolean;
  supportedLanguages: string[];
  supportedCurrencies: string[];
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  conversionRate: number;
  lastUpdated: Date;
}

interface GlobalReceiptData extends ExtractedTransactionData {
  originalCurrency?: string;
  originalAmount?: number;
  convertedAmount?: number;
  conversionRate?: number;
  detectedLanguage: string;
  confidence: number;
  regionalPatterns: RegionalPattern[];
  countryCode?: string;
  processingTime?: number;
}

interface RegionalPattern {
  country: string;
  dateFormat: string;
  numberFormat: string;
  addressFormat: string;
  commonMerchants: string[];
  culturalContext: string[];
}

interface LanguageDetectionResult {
  language: string;
  confidence: number;
  script: string;
  alternatives: { language: string; confidence: number }[];
}

export class GlobalOCREngine {
  private config: GlobalOCRConfig;
  private currencyRates: Map<string, CurrencyInfo>;
  private languageModels: Map<string, any>;
  private regionalPatterns: Map<string, RegionalPattern>;
  private tesseractWorkers: Map<string, any>;

  constructor(config?: Partial<GlobalOCRConfig>) {
    this.config = {
      defaultCurrency: 'INR',
      defaultLanguage: 'en',
      enableAutoLanguageDetection: true,
      enableCurrencyConversion: true,
      supportedLanguages: [
        'eng', 'hin', 'tam', 'ben', 'urd', 'guj', 'kan', 'mal', 'ori', 'pan', 'tel',
        'fra', 'deu', 'spa', 'ita', 'por', 'rus', 'ara', 'chi_sim', 'chi_tra', 'jpn', 'kor'
      ],
      supportedCurrencies: [
        'INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'SGD',
        'HKD', 'AED', 'SAR', 'THB', 'MYR', 'KRW', 'TWD', 'PHP', 'IDR', 'VND'
      ],
      ...config
    };

    this.currencyRates = new Map();
    this.languageModels = new Map();
    this.regionalPatterns = new Map();
    this.tesseractWorkers = new Map();

    this.initializeGlobalEngine();
  }

  /**
   * Process international receipt with auto-detection
   */
  async processInternationalReceipt(file: File): Promise<GlobalReceiptData> {
    const startTime = Date.now();
    
    try {
      // Step 1: Detect language and region
      const languageDetection = await this.detectDocumentLanguage(file);
      
      // Step 2: Process with appropriate language model
      const ocrResult = await this.processWithLanguage(file, languageDetection.language);
      
      // Step 3: Detect currency and region
      const currencyDetection = await this.detectCurrencyAndRegion(ocrResult.text);
      
      // Step 4: Extract transaction data with regional patterns
      const extractedData = await this.extractWithRegionalPatterns(
        ocrResult.text,
        languageDetection.language,
        currencyDetection.country
      );
      
      // Step 5: Convert currency if needed
      let convertedData = extractedData;
      if (this.config.enableCurrencyConversion && currencyDetection.currency !== this.config.defaultCurrency) {
        convertedData = await this.convertCurrency(extractedData, currencyDetection.currency);
      }
      
      // Step 6: Apply regional validation
      const validatedData = await this.validateWithRegionalRules(convertedData, currencyDetection.country);
      
      const processingTime = Date.now() - startTime;
      
      return {
        ...validatedData,
        originalCurrency: currencyDetection.currency,
        originalAmount: extractedData.amount,
        convertedAmount: convertedData.amount,
        conversionRate: currencyDetection.currency !== this.config.defaultCurrency ? 
          this.currencyRates.get(currencyDetection.currency)?.conversionRate : 1,
        detectedLanguage: languageDetection.language,
        confidence: Math.min(
          languageDetection.confidence,
          ocrResult.confidence,
          validatedData.confidence || 0.8
        ),
        regionalPatterns: [this.regionalPatterns.get(currencyDetection.country)!].filter(Boolean),
        countryCode: currencyDetection.country,
        processingTime
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Global OCR processing failed: ${errorMessage}`);
    }
  }

  /**
   * Detect document language from image
   */
  private async detectDocumentLanguage(file: File): Promise<LanguageDetectionResult> {
    // Quick OCR scan with multiple language models
    const quickScanResults = await Promise.all([
      this.quickScanWithLanguage(file, 'eng'),
      this.quickScanWithLanguage(file, 'chi_sim'),
      this.quickScanWithLanguage(file, 'jpn'),
      this.quickScanWithLanguage(file, 'ara'),
      this.quickScanWithLanguage(file, 'fra')
    ]);
    
    // Analyze results to determine best language
    let bestLanguage = 'eng';
    let bestConfidence = 0;
    const alternatives: { language: string; confidence: number }[] = [];
    
    for (const result of quickScanResults) {
      if (result.confidence > bestConfidence) {
        if (bestConfidence > 0) {
          alternatives.push({ language: bestLanguage, confidence: bestConfidence });
        }
        bestLanguage = result.language;
        bestConfidence = result.confidence;
      } else {
        alternatives.push({ language: result.language, confidence: result.confidence });
      }
    }
    
    // Additional script detection
    const script = this.detectScript(quickScanResults.find(r => r.language === bestLanguage)?.text || '');
    
    return {
      language: bestLanguage,
      confidence: bestConfidence,
      script,
      alternatives: alternatives.sort((a, b) => b.confidence - a.confidence)
    };
  }

  /**
   * Quick scan with specific language
   */
  private async quickScanWithLanguage(
    file: File, 
    language: string
  ): Promise<{ language: string; confidence: number; text: string }> {
    try {
      const worker = await this.getTesseractWorker(language);
      
      // Use lower quality settings for speed
      const { data } = await worker.recognize(file, {
        tessedit_pageseg_mode: '6', // Single uniform block
        tessedit_ocr_engine_mode: '2' // LSTM only
      });
      
      return {
        language,
        confidence: data.confidence / 100,
        text: data.text
      };
    } catch (error) {
      return {
        language,
        confidence: 0,
        text: ''
      };
    }
  }

  /**
   * Process document with detected language
   */
  private async processWithLanguage(
    file: File,
    language: string
  ): Promise<{ text: string; confidence: number; data: any }> {
    const worker = await this.getTesseractWorker(language);
    
    const { data } = await worker.recognize(file, {
      tessedit_pageseg_mode: '1', // Automatic page segmentation
      tessedit_ocr_engine_mode: '2', // LSTM only
      preserve_interword_spaces: '1'
    });
    
    return {
      text: data.text,
      confidence: data.confidence / 100,
      data
    };
  }

  /**
   * Detect currency and region from text
   */
  private async detectCurrencyAndRegion(text: string): Promise<{
    currency: string;
    country: string;
    confidence: number;
  }> {
    const currencyPatterns = {
      'USD': [/\$\s*\d+/, /USD\s*\d+/, /dollars?/i],
      'EUR': [/€\s*\d+/, /EUR\s*\d+/, /euros?/i],
      'GBP': [/£\s*\d+/, /GBP\s*\d+/, /pounds?/i],
      'JPY': [/¥\s*\d+/, /JPY\s*\d+/, /yen/i],
      'CNY': [/¥\s*\d+/, /CNY\s*\d+/, /yuan|rmb/i],
      'INR': [/₹\s*\d+/, /INR\s*\d+/, /rupees?/i],
      'AUD': [/A\$\s*\d+/, /AUD\s*\d+/],
      'CAD': [/C\$\s*\d+/, /CAD\s*\d+/],
      'SGD': [/S\$\s*\d+/, /SGD\s*\d+/],
      'HKD': [/HK\$\s*\d+/, /HKD\s*\d+/],
      'AED': [/AED\s*\d+/, /dirhams?/i],
      'THB': [/฿\s*\d+/, /THB\s*\d+/, /baht/i],
      'KRW': [/₩\s*\d+/, /KRW\s*\d+/, /won/i]
    };
    
    const countryMapping: Record<string, string> = {
      'USD': 'US', 'EUR': 'EU', 'GBP': 'GB', 'JPY': 'JP', 'CNY': 'CN',
      'INR': 'IN', 'AUD': 'AU', 'CAD': 'CA', 'SGD': 'SG', 'HKD': 'HK',
      'AED': 'AE', 'THB': 'TH', 'KRW': 'KR'
    };
    
    let detectedCurrency = this.config.defaultCurrency;
    let maxMatches = 0;
    
    for (const [currency, patterns] of Object.entries(currencyPatterns)) {
      let matches = 0;
      for (const pattern of patterns) {
        const found = text.match(new RegExp(pattern, 'gi'));
        if (found) matches += found.length;
      }
      
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCurrency = currency;
      }
    }
    
    return {
      currency: detectedCurrency,
      country: (countryMapping as Record<string, string>)[detectedCurrency] || 'IN',
      confidence: maxMatches > 0 ? Math.min(maxMatches / 3, 1) : 0.1
    };
  }

  /**
   * Extract data using regional patterns
   */
  private async extractWithRegionalPatterns(
    text: string,
    language: string,
    country: string
  ): Promise<ExtractedTransactionData> {
    const regionalPattern = this.regionalPatterns.get(country);
    const extractedData: ExtractedTransactionData = {
      confidence: 0.8
    };
    
    // Extract amount with regional number format
    extractedData.amount = this.extractAmountWithRegionalFormat(text, country);
    
    // Extract date with regional format
    extractedData.date = this.extractDateWithRegionalFormat(text, country);
    
    // Extract merchant with regional context
    extractedData.merchant = this.extractMerchantWithRegionalContext(text, country);
    
    // Extract category based on regional patterns
    extractedData.category = this.extractCategoryWithRegionalContext(text, country);
    
    // Generate description
    extractedData.description = this.generateRegionalDescription(text, extractedData, country);
    
    return extractedData;
  }

  /**
   * Convert currency to default currency
   */
  private async convertCurrency(
    data: ExtractedTransactionData,
    fromCurrency: string
  ): Promise<ExtractedTransactionData> {
    if (!data.amount || fromCurrency === this.config.defaultCurrency) {
      return data;
    }
    
    const currencyInfo = this.currencyRates.get(fromCurrency);
    if (!currencyInfo) {
      // Fetch latest rate if not available
      await this.updateCurrencyRate(fromCurrency);
    }
    
    const rate = this.currencyRates.get(fromCurrency)?.conversionRate || 1;
    const convertedAmount = data.amount * rate;
    
    return {
      ...data,
      amount: Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Initialize global engine with patterns and rates
   */
  private async initializeGlobalEngine(): Promise<void> {
    // Initialize currency rates
    await this.initializeCurrencyRates();
    
    // Initialize regional patterns
    this.initializeRegionalPatterns();
    
    // Initialize language models (lightweight initialization)
    this.initializeLanguageModels();
  }

  /**
   * Initialize currency rates
   */
  private async initializeCurrencyRates(): Promise<void> {
    const baseCurrency = this.config.defaultCurrency;
    
    // Default rates (in production, fetch from API)
    const defaultRates = {
      'USD': 83.25,
      'EUR': 90.50,
      'GBP': 105.75,
      'JPY': 0.56,
      'CNY': 11.45,
      'AUD': 54.30,
      'CAD': 61.25,
      'CHF': 92.80,
      'SGD': 61.90,
      'HKD': 10.65,
      'AED': 22.65,
      'SAR': 22.20,
      'THB': 2.35,
      'MYR': 18.85,
      'KRW': 0.063,
      'TWD': 2.58,
      'PHP': 1.48,
      'IDR': 0.0054,
      'VND': 0.0034
    };
    
    for (const [currency, rate] of Object.entries(defaultRates)) {
      this.currencyRates.set(currency, {
        code: currency,
        symbol: this.getCurrencySymbol(currency),
        name: this.getCurrencyName(currency),
        conversionRate: rate,
        lastUpdated: new Date()
      });
    }
    
    // Add base currency
    this.currencyRates.set(baseCurrency, {
      code: baseCurrency,
      symbol: this.getCurrencySymbol(baseCurrency),
      name: this.getCurrencyName(baseCurrency),
      conversionRate: 1,
      lastUpdated: new Date()
    });
  }

  /**
   * Initialize regional patterns
   */
  private initializeRegionalPatterns(): void {
    // United States
    this.regionalPatterns.set('US', {
      country: 'US',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: '1,234.56',
      addressFormat: 'Street, City, State ZIP',
      commonMerchants: ['Walmart', 'Target', 'Starbucks', 'McDonald\'s', 'Amazon'],
      culturalContext: ['tax', 'tip', 'sales tax', 'gratuity']
    });
    
    // European Union
    this.regionalPatterns.set('EU', {
      country: 'EU',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1.234,56',
      addressFormat: 'Street, Postal Code City',
      commonMerchants: ['Carrefour', 'Tesco', 'H&M', 'IKEA'],
      culturalContext: ['VAT', 'TVA', 'IVA', 'MwSt']
    });
    
    // Japan
    this.regionalPatterns.set('JP', {
      country: 'JP',
      dateFormat: 'YYYY/MM/DD',
      numberFormat: '1,234',
      addressFormat: 'Prefecture, City, District',
      commonMerchants: ['7-Eleven', 'FamilyMart', 'Lawson', 'Uniqlo'],
      culturalContext: ['消費税', 'tax', '税込', '税抜']
    });
    
    // China
    this.regionalPatterns.set('CN', {
      country: 'CN',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: '1,234.56',
      addressFormat: 'Province, City, District',
      commonMerchants: ['Alipay', 'WeChat Pay', 'Taobao', 'JD.com'],
      culturalContext: ['税', '增值税', 'VAT', 'tax']
    });
    
    // India (default)
    this.regionalPatterns.set('IN', {
      country: 'IN',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,23,456.78',
      addressFormat: 'Street, City, State PIN',
      commonMerchants: ['Zomato', 'Swiggy', 'Amazon', 'Flipkart', 'Paytm'],
      culturalContext: ['GST', 'CGST', 'SGST', 'IGST', 'tax']
    });
  }

  /**
   * Get or create Tesseract worker for language
   */
  private async getTesseractWorker(language: string): Promise<any> {
    if (!this.tesseractWorkers.has(language)) {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(language);
      this.tesseractWorkers.set(language, worker);
    }
    
    return this.tesseractWorkers.get(language);
  }

  // Additional helper methods would be implemented here...
  private detectScript(text: string): string {
    // Implement script detection logic
    return 'Latin';
  }

  private extractAmountWithRegionalFormat(text: string, country: string): number | undefined {
    // Implement regional number format parsing
    return undefined;
  }

  private extractDateWithRegionalFormat(text: string, country: string): string | undefined {
    // Implement regional date format parsing
    return undefined;
  }

  private extractMerchantWithRegionalContext(text: string, country: string): string | undefined {
    // Implement regional merchant extraction
    return undefined;
  }

  private extractCategoryWithRegionalContext(text: string, country: string): string | undefined {
    // Implement regional category extraction
    return undefined;
  }

  private generateRegionalDescription(
    text: string, 
    data: ExtractedTransactionData, 
    country: string
  ): string {
    // Implement regional description generation
    return text.substring(0, 100);
  }

  private async validateWithRegionalRules(
    data: ExtractedTransactionData,
    country: string
  ): Promise<ExtractedTransactionData> {
    // Implement regional validation rules
    return data;
  }

  private async updateCurrencyRate(currency: string): Promise<void> {
    // Implement currency rate fetching from API
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
      'INR': '₹', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'HKD': 'HK$',
      'AED': 'AED', 'THB': '฿', 'KRW': '₩'
    };
    return symbols[currency] || currency;
  }

  private getCurrencyName(currency: string): string {
    const names: Record<string, string> = {
      'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
      'JPY': 'Japanese Yen', 'CNY': 'Chinese Yuan', 'INR': 'Indian Rupee',
      'AUD': 'Australian Dollar', 'CAD': 'Canadian Dollar'
    };
    return names[currency] || currency;
  }

  private initializeLanguageModels(): void {
    // Initialize lightweight language models
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    for (const worker of this.tesseractWorkers.values()) {
      await worker.terminate();
    }
    this.tesseractWorkers.clear();
  }
}

export default GlobalOCREngine;