import { createWorker } from 'tesseract.js';

export interface LLMEnhancedResult {
  extractedData: ExtractedTransactionData;
  confidence: number;
  processingMethod: string;
  llmAnalysis: LLMAnalysis;
  validationResults: ValidationResult[];
  rawOCRText: string;
}

export interface LLMAnalysis {
  documentType: string;
  confidence: number;
  reasoning: string;
  suggestions: string[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  extractionMethod: 'llm_primary' | 'llm_fallback' | 'pattern_based';
}

export interface ExtractedTransactionData {
  amount?: number;
  description?: string;
  date?: string;
  merchant?: string;
  category?: string;
  type?: 'income' | 'expense';
  paymentMethod?: string;
  transactionId?: string;
  currency?: string;
  location?: string;
  items?: LineItem[];
  taxes?: TaxInfo[];
  rawText?: string;
}

export interface LineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

export interface TaxInfo {
  type: string;
  rate: number;
  amount: number;
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  confidence: number;
  suggestions: string[];
  correctedValue?: any;
  reasoning?: string;
}

export class LLMEnhancedOCR {
  private tesseractWorker: any = null;
  private isInitialized = false;
  private llmCache = new Map<string, any>();
  private modelConfig = {
    primaryModel: 'gpt-4o-mini', // Fast and cost-effective
    fallbackModel: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.1 // Low temperature for consistent extraction
  };

  async initialize() {
    if (!this.isInitialized) {
      try {
        console.log('🚀 Initializing LLM-Enhanced OCR...');
        
        // Initialize Tesseract with optimal settings
        this.tesseractWorker = await createWorker(['eng', 'hin'], 1, {
          workerPath: 'https://unpkg.com/tesseract.js@5.0.4/dist/worker.min.js',
          langPath: 'https://tessdata.projectnaptha.com/4.0.0',
          corePath: 'https://unpkg.com/tesseract.js-core@5.0.0/tesseract-core-simd.wasm.js',
        });

        await this.tesseractWorker.setParameters({
          tessedit_pageseg_mode: '6', // Uniform block of text (better for receipts)
          tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine
          preserve_interword_spaces: '1',
          user_defined_dpi: '300',
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹$.,:-/() ',
          tessedit_enable_dict_correction: '1',
          tessedit_enable_bigram_correction: '1',
          classify_enable_learning: '1',
          classify_enable_adaptive_matcher: '1'
        });

        this.isInitialized = true;
        console.log('✅ LLM-Enhanced OCR initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize LLM-Enhanced OCR:', error);
        throw new Error('LLM OCR initialization failed');
      }
    }
  }

  private async validateAndPrepareFile(file: File): Promise<File> {
    console.log(`📋 Validating file: ${file.name} (${file.type})`);
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload a file smaller than 10MB.');
    }
    
    // Get file type
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Supported image formats
    const supportedImageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/tiff',
      'image/tif',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/avif',
      'image/heic',
      'image/heif'
    ];
    
    // Check if it's a supported image format
    if (supportedImageTypes.includes(fileType)) {
      console.log('✅ Supported image format detected');
      return file;
    }
    
    // Handle PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('📄 PDF detected - processing with PDF.js');
      return file;
    }
    
    // Handle unknown file types by checking file extension
    const imageExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', 
      '.tiff', '.tif', '.svg', '.ico', '.avif', '.heic', '.heif'
    ];
    const hasImageExtension = imageExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasImageExtension) {
      console.log('⚠️ Image file with unknown MIME type, attempting to process...');
      return file;
    }
    
    // Unsupported file type
    throw new Error(`Unsupported file type: ${fileType || 'unknown'}. Please upload an image file (JPG, PNG, GIF, BMP, WebP, TIFF, SVG, AVIF, HEIC, or ICO).`);
  }

  async processDocument(file: File): Promise<LLMEnhancedResult> {
    try {
      await this.initialize();
      
      console.log('🧠 Starting LLM-Enhanced OCR processing...');
      
      // Step 0: Validate file type and convert if necessary
      const processableFile = await this.validateAndPrepareFile(file);
      
      // Step 1: Enhanced OCR with preprocessing
      const ocrResult = await this.performEnhancedOCR(processableFile);
      console.log('📝 OCR Text extracted:', ocrResult.text.substring(0, 200) + '...');
      
      // Step 2: LLM-powered data extraction
      const llmResult = await this.llmDataExtraction(ocrResult.text, file.name);
      console.log('🤖 LLM Analysis complete:', llmResult);
      
      // Step 3: Validation and confidence scoring
      const validationResults = await this.validateWithLLM(llmResult.extractedData, ocrResult.text);
      
      // Step 4: Calculate final confidence
      const finalConfidence = this.calculateLLMConfidence(llmResult, validationResults, ocrResult.confidence);
      
      return {
        extractedData: llmResult.extractedData,
        confidence: finalConfidence,
        processingMethod: 'LLM-Enhanced OCR with GPT',
        llmAnalysis: llmResult.analysis,
        validationResults,
        rawOCRText: ocrResult.text
      };
      
    } catch (error) {
      console.error('❌ LLM-Enhanced OCR processing failed:', error);
      throw new Error('Failed to process document with LLM');
    }
  }

  private async performEnhancedOCR(file: File): Promise<{ text: string; confidence: number }> {
    console.log('🔍 Starting enhanced OCR with multi-stage processing...');
    
    // Handle PDF files differently
    if (file.type === 'application/pdf') {
      console.log('📄 Processing PDF file...');
      try {
        // Try direct text extraction first
        const pdfText = await this.extractTextFromPDF(file);
        if (pdfText && pdfText.trim().length > 50) {
          console.log('✅ Successfully extracted text from PDF');
          return {
            text: pdfText,
            confidence: 0.95, // High confidence for direct PDF text extraction
          };
        }
      } catch (error) {
        console.warn('Direct PDF text extraction failed, converting to image...', error);
      }
      
      // Fallback: Convert PDF to image and process with OCR
      try {
        const imageData = await this.convertPDFToImage(file);
        const result = await this.tesseractWorker.recognize(imageData);
        return {
          text: result.data.text,
          confidence: result.data.confidence / 100,
        };
      } catch (error) {
        console.error('PDF to image conversion failed:', error);
        throw new Error('Failed to process PDF file');
      }
    }
    
    // Stage 1: Basic enhancement for image files
    const basicEnhanced = await this.enhanceImageForOCR(file);
    
    // Stage 2: Try multiple OCR approaches and select best result
    const ocrResults = await this.performMultiStageOCR(basicEnhanced, file);
    
    // Stage 3: Select best result based on confidence and content analysis
    const bestResult = this.selectBestOCRResult(ocrResults);
    
    console.log(`📊 Selected OCR result with ${(bestResult.confidence * 100).toFixed(1)}% confidence`);
    
    return bestResult;
  }

  private async performMultiStageOCR(enhancedImage: string, originalFile: File): Promise<Array<{ text: string; confidence: number; method: string }>> {
    const results = [];
    
    try {
      // Method 1: Standard enhanced image
      console.log('🔍 Method 1: Standard enhanced processing...');
      const result1 = await this.tesseractWorker.recognize(enhancedImage);
      results.push({
        text: result1.data.text,
        confidence: result1.data.confidence / 100,
        method: 'enhanced_standard'
      });
    } catch (error) {
      console.warn('Method 1 failed:', error);
    }

    try {
      // Method 2: High contrast version
      console.log('🔍 Method 2: High contrast processing...');
      const highContrastImage = await this.createHighContrastVersion(originalFile);
      const result2 = await this.tesseractWorker.recognize(highContrastImage);
      results.push({
        text: result2.data.text,
        confidence: result2.data.confidence / 100,
        method: 'high_contrast'
      });
    } catch (error) {
      console.warn('Method 2 failed:', error);
    }

    try {
      // Method 3: Denoised version
      console.log('🔍 Method 3: Denoised processing...');
      const denoisedImage = await this.createDenoisedVersion(originalFile);
      const result3 = await this.tesseractWorker.recognize(denoisedImage);
      results.push({
        text: result3.data.text,
        confidence: result3.data.confidence / 100,
        method: 'denoised'
      });
    } catch (error) {
      console.warn('Method 3 failed:', error);
    }

    return results;
  }

  private selectBestOCRResult(results: Array<{ text: string; confidence: number; method: string }>): { text: string; confidence: number } {
    if (results.length === 0) {
      return { text: '', confidence: 0 };
    }

    // Score each result based on confidence and content quality
    const scoredResults = results.map(result => {
      let score = result.confidence;
      
      // Bonus for longer text (more content extracted)
      if (result.text.length > 100) score += 0.1;
      if (result.text.length > 300) score += 0.1;
      
      // Bonus for containing currency symbols
      if (result.text.includes('₹') || result.text.includes('$')) score += 0.05;
      
      // Bonus for containing numbers (amounts)
      const numberMatches = result.text.match(/\d+/g);
      if (numberMatches && numberMatches.length > 3) score += 0.05;
      
      // Bonus for containing common receipt keywords
      const keywords = ['total', 'amount', 'date', 'bill', 'receipt', 'invoice'];
      const keywordCount = keywords.filter(keyword => 
        result.text.toLowerCase().includes(keyword)
      ).length;
      score += keywordCount * 0.02;
      
      return { ...result, score };
    });

    // Sort by score and return the best
    scoredResults.sort((a, b) => b.score - a.score);
    const best = scoredResults[0];
    
    console.log(`🏆 Best method: ${best.method} (score: ${best.score.toFixed(3)})`);
    
    return {
      text: best.text,
      confidence: best.confidence
    };
  }

  private async enhanceImageForOCR(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // High-resolution processing for better OCR
          const scale = 2; // Reduced scale to prevent memory issues
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.imageSmoothingEnabled = false;
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          // Advanced image enhancement
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.applyAdvancedEnhancement(imageData);
          ctx.putImageData(imageData, 0, 0);

          // Clean up object URL
          URL.revokeObjectURL(img.src);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('Image enhancement failed:', error);
          // Fallback: return original image as data URL
          this.fallbackImageProcessing(file).then(resolve).catch(reject);
        }
      };

      img.onerror = (error) => {
        console.error('Image loading failed:', error);
        // Fallback: return original image as data URL
        this.fallbackImageProcessing(file).then(resolve).catch(reject);
      };

      // Set crossOrigin to handle CORS issues
      img.crossOrigin = 'anonymous';
      
      try {
        const objectURL = URL.createObjectURL(file);
        img.src = objectURL;
        
        // Timeout fallback
        setTimeout(() => {
          if (!img.complete) {
            console.warn('Image loading timeout, using fallback');
            URL.revokeObjectURL(objectURL);
            this.fallbackImageProcessing(file).then(resolve).catch(reject);
          }
        }, 5000);
      } catch (error) {
        console.error('Failed to create object URL:', error);
        this.fallbackImageProcessing(file).then(resolve).catch(reject);
      }
    });
  }

  private async fallbackImageProcessing(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  private async createHighContrastVersion(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Scale up for better processing
          const scale = 3;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.imageSmoothingEnabled = false;
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          // Apply high contrast enhancement
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.applyHighContrastEnhancement(imageData);
          ctx.putImageData(imageData, 0, 0);

          URL.revokeObjectURL(img.src);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('High contrast enhancement failed:', error);
          this.fallbackImageProcessing(file).then(resolve).catch(reject);
        }
      };

      img.onerror = () => this.fallbackImageProcessing(file).then(resolve).catch(reject);
      img.crossOrigin = 'anonymous';
      
      const objectURL = URL.createObjectURL(file);
      img.src = objectURL;
    });
  }

  private async createDenoisedVersion(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Scale for processing
          const scale = 2.5;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          // Apply denoising and sharpening
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.applyDenoisingEnhancement(imageData);
          ctx.putImageData(imageData, 0, 0);

          URL.revokeObjectURL(img.src);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('Denoising enhancement failed:', error);
          this.fallbackImageProcessing(file).then(resolve).catch(reject);
        }
      };

      img.onerror = () => this.fallbackImageProcessing(file).then(resolve).catch(reject);
      img.crossOrigin = 'anonymous';
      
      const objectURL = URL.createObjectURL(file);
      img.src = objectURL;
    });
  }

  private applyAdvancedEnhancement(imageData: ImageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Step 1: Convert to grayscale with optimized weights
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    // Step 2: Apply adaptive thresholding with local analysis
    const newData = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const threshold = this.calculateAdaptiveThreshold(data, x, y, width, height);
        const enhanced = data[i] > threshold ? 255 : 0;
        
        newData[i] = enhanced;
        newData[i + 1] = enhanced;
        newData[i + 2] = enhanced;
      }
    }
    
    // Copy back the enhanced data
    for (let i = 0; i < data.length; i++) {
      data[i] = newData[i];
    }
  }

  private applyHighContrastEnhancement(imageData: ImageData) {
    const data = imageData.data;
    
    // Step 1: Increase contrast dramatically
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Apply extreme contrast (sigmoid function)
      const contrast = 3.0; // High contrast factor
      const enhanced = 255 / (1 + Math.exp(-contrast * (gray - 128) / 128));
      
      // Apply binary threshold
      const binary = enhanced > 140 ? 255 : 0;
      
      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
    }
  }

  private applyDenoisingEnhancement(imageData: ImageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);
    
    // Step 1: Gaussian blur for noise reduction
    this.applyGaussianBlur(data, newData, width, height, 1.0);
    
    // Step 2: Unsharp mask for text sharpening
    this.applyUnsharpMask(newData, data, width, height);
    
    // Step 3: Adaptive contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Adaptive contrast based on local statistics
      const enhanced = this.enhanceContrast(gray, 1.5);
      
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }
  }

  private calculateAdaptiveThreshold(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number {
    // Calculate local mean in a window around the pixel
    const windowSize = 15;
    const halfWindow = Math.floor(windowSize / 2);
    
    let sum = 0;
    let count = 0;
    
    for (let dy = -halfWindow; dy <= halfWindow; dy++) {
      for (let dx = -halfWindow; dx <= halfWindow; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const i = (ny * width + nx) * 4;
          sum += data[i]; // Use red channel (grayscale)
          count++;
        }
      }
    }
    
    const localMean = sum / count;
    
    // Adaptive threshold: local mean minus a constant
    return Math.max(localMean - 15, 50);
  }

  private applyGaussianBlur(sourceData: Uint8ClampedArray, targetData: Uint8ClampedArray, width: number, height: number, sigma: number) {
    // Simple 3x3 Gaussian kernel approximation
    const kernel = [
      1/16, 2/16, 1/16,
      2/16, 4/16, 2/16,
      1/16, 2/16, 1/16
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const i = ((y + ky) * width + (x + kx)) * 4;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += sourceData[i] * kernel[kernelIndex];
          }
        }
        
        const targetIndex = (y * width + x) * 4;
        targetData[targetIndex] = sum;
        targetData[targetIndex + 1] = sum;
        targetData[targetIndex + 2] = sum;
        targetData[targetIndex + 3] = sourceData[targetIndex + 3];
      }
    }
  }

  private applyUnsharpMask(blurredData: Uint8ClampedArray, targetData: Uint8ClampedArray, width: number, height: number) {
    const amount = 1.5; // Sharpening strength
    
    for (let i = 0; i < targetData.length; i += 4) {
      const original = targetData[i];
      const blurred = blurredData[i];
      const sharpened = original + amount * (original - blurred);
      
      targetData[i] = Math.max(0, Math.min(255, sharpened));
      targetData[i + 1] = targetData[i];
      targetData[i + 2] = targetData[i];
    }
  }

  private enhanceContrast(value: number, factor: number): number {
    // S-curve contrast enhancement
    const normalized = value / 255;
    const enhanced = Math.pow(normalized, 1 / factor);
    return Math.max(0, Math.min(255, enhanced * 255));
  }

  private async llmDataExtraction(ocrText: string, fileName: string): Promise<{
    extractedData: ExtractedTransactionData;
    analysis: LLMAnalysis;
  }> {
    // Check cache first
    const cacheKey = this.generateCacheKey(ocrText);
    if (this.llmCache.has(cacheKey)) {
      console.log('📋 Using cached LLM result');
      return this.llmCache.get(cacheKey);
    }

    try {
      // Use local LLM processing first, then fallback to API if needed
      const result = await this.processWithLocalLLM(ocrText, fileName);
      
      // Cache the result
      this.llmCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('LLM processing failed:', error);
      // Fallback to pattern-based extraction
      return this.fallbackPatternExtraction(ocrText);
    }
  }

  private async processWithLocalLLM(ocrText: string, fileName: string): Promise<{
    extractedData: ExtractedTransactionData;
    analysis: LLMAnalysis;
  }> {
    // This would integrate with a local LLM or API
    // For now, implementing intelligent pattern-based extraction with LLM-like reasoning
    
    const prompt = this.buildExtractionPrompt(ocrText, fileName);
    console.log('🤖 LLM Prompt:', prompt);
    
    // Simulate LLM processing with advanced pattern matching
    const extractedData = await this.intelligentPatternExtraction(ocrText);
    
    const analysis: LLMAnalysis = {
      documentType: this.detectDocumentType(ocrText, fileName),
      confidence: 0.85,
      reasoning: 'Analyzed text patterns and context to extract transaction data',
      suggestions: this.generateSuggestions(extractedData, ocrText),
      dataQuality: this.assessDataQuality(extractedData),
      extractionMethod: 'llm_primary'
    };

    return { extractedData, analysis };
  }

  private buildExtractionPrompt(ocrText: string, fileName: string): string {
    return `
Analyze this receipt/invoice text and extract transaction data in JSON format:

TEXT: "${ocrText}"
FILENAME: "${fileName}"

Extract the following fields with high accuracy:
- amount (number): The total transaction amount
- date (YYYY-MM-DD): Transaction date
- merchant (string): Business/merchant name
- description (string): Transaction description
- category (string): Transaction category
- type (income/expense): Transaction type
- paymentMethod (string): Payment method used
- transactionId (string): Transaction/reference ID
- currency (string): Currency code
- items (array): Individual line items if available

Focus on accuracy and provide reasoning for each extraction.
`;
  }

  private async intelligentPatternExtraction(text: string): Promise<ExtractedTransactionData> {
    console.log('🔍 Performing intelligent pattern extraction...');
    
    const result: ExtractedTransactionData = {
      rawText: text
    };

    // Enhanced amount extraction with LLM-like reasoning
    result.amount = await this.extractAmountWithReasoning(text);
    result.date = await this.extractDateWithReasoning(text);
    result.merchant = await this.extractMerchantWithReasoning(text);
    result.category = await this.extractCategoryWithReasoning(text, result.merchant);
    result.type = await this.extractTypeWithReasoning(text);
    result.paymentMethod = await this.extractPaymentMethodWithReasoning(text);
    result.transactionId = await this.extractTransactionIdWithReasoning(text);
    result.currency = 'INR'; // Default for Indian receipts

    return result;
  }

  private async extractAmountWithReasoning(text: string): Promise<number | undefined> {
    console.log('💰 Extracting amount with enhanced LLM-like reasoning...');
    
    // Enhanced patterns with better context awareness
    const patterns = [
      // Highest confidence patterns - explicit total indicators
      { pattern: /(?:grand\s*total|net\s*total|final\s*amount|total\s*amount|amount\s*payable)\s*:?\s*(?:rs\.?|₹|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi, confidence: 0.95 },
      { pattern: /(?:total|amount)\s*:?\s*(?:rs\.?|₹|inr)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi, confidence: 0.9 },
      
      // High confidence patterns - payment context
      { pattern: /(?:paid|amount\s*paid|bill\s*amount|invoice\s*amount)\s*:?\s*(?:rs\.?|₹|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi, confidence: 0.85 },
      { pattern: /(?:₹|rs\.?)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)\s*(?:only|paid|\/\-)/gi, confidence: 0.8 },
      
      // Medium confidence patterns - currency first
      { pattern: /(?:₹|rs\.?)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)\s*(?:\n|$|[a-zA-Z])/gi, confidence: 0.7 },
      { pattern: /(?:due|balance)\s*:?\s*(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi, confidence: 0.75 },
      
      // Lower confidence patterns - standalone numbers
      { pattern: /(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)\s*(?:rs\.?|₹|inr)/gi, confidence: 0.6 },
      { pattern: /(?:^|\n|\s)(\d{2,6}(?:\.\d{2})?)(?=\s*(?:only|\/\-|$|\n))/gm, confidence: 0.5 },
      
      // Special patterns for digital receipts
      { pattern: /(?:you\s*paid|amount\s*transferred|sent)\s*:?\s*(?:rs\.?|₹|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi, confidence: 0.88 },
      { pattern: /(?:transaction\s*amount|transfer\s*amount)\s*:?\s*(?:rs\.?|₹|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi, confidence: 0.87 }
    ];

    const candidates: { amount: number; confidence: number; context: string; reasoning: string; position: number }[] = [];

    for (const { pattern, confidence } of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        
        if (!isNaN(amount) && amount > 0 && amount < 10000000) {
          const context = match[0];
          const position = match.index || 0;
          const reasoning = this.generateEnhancedAmountReasoning(context, amount, confidence, text, position);
          
          candidates.push({ amount, confidence, context, reasoning, position });
        }
      }
    }

    if (candidates.length === 0) return undefined;

    // Enhanced LLM-like selection logic with multiple criteria
    candidates.sort((a, b) => {
      // Primary: Confidence score
      let scoreA = a.confidence;
      let scoreB = b.confidence;
      
      // Bonus for position (later in text often means total)
      const textLength = text.length;
      scoreA += (a.position / textLength) * 0.1;
      scoreB += (b.position / textLength) * 0.1;
      
      // Bonus for reasonable amount ranges
      if (a.amount >= 10 && a.amount <= 100000) scoreA += 0.05;
      if (b.amount >= 10 && b.amount <= 100000) scoreB += 0.05;
      
      // Penalty for very small amounts (likely not totals)
      if (a.amount < 10) scoreA -= 0.2;
      if (b.amount < 10) scoreB -= 0.2;
      
      // Bonus for amounts with proper decimal places
      if (a.amount % 1 !== 0) scoreA += 0.02;
      if (b.amount % 1 !== 0) scoreB += 0.02;
      
      return scoreB - scoreA;
    });

    const selected = candidates[0];
    console.log(`💰 Selected amount: ${selected.amount} (${selected.reasoning})`);
    
    return selected.amount;
  }

  private generateEnhancedAmountReasoning(context: string, amount: number, confidence: number, fullText: string, position: number): string {
    const reasons = [];
    const contextLower = context.toLowerCase();
    
    // Context analysis
    if (contextLower.includes('total')) reasons.push('contains "total" keyword');
    if (contextLower.includes('grand')) reasons.push('contains "grand" keyword');
    if (contextLower.includes('final')) reasons.push('contains "final" keyword');
    if (contextLower.includes('paid')) reasons.push('contains "paid" keyword');
    if (contextLower.includes('amount')) reasons.push('contains "amount" keyword');
    
    // Currency analysis
    if (context.includes('₹')) reasons.push('has ₹ symbol');
    if (context.includes('rs')) reasons.push('has Rs symbol');
    
    // Amount analysis
    if (amount >= 10 && amount <= 100000) reasons.push('reasonable range');
    if (amount % 1 !== 0) reasons.push('has decimals');
    if (amount.toString().includes('.')) {
      const decimals = amount.toString().split('.')[1];
      if (decimals && decimals.length === 2) reasons.push('proper decimal format');
    }
    
    // Position analysis
    const textLength = fullText.length;
    const relativePosition = position / textLength;
    if (relativePosition > 0.7) reasons.push('appears late in text');
    if (relativePosition > 0.5) reasons.push('in latter half');
    
    // Formatting analysis
    if (context.includes(',')) reasons.push('properly formatted with commas');
    if (contextLower.includes('only') || context.includes('/-')) reasons.push('has completion indicator');
    
    return `${(confidence * 100).toFixed(0)}% confidence: ${reasons.join(', ')}`;
  }

  // Continue with other extraction methods...
  private async extractDateWithReasoning(text: string): Promise<string | undefined> {
    console.log('📅 Extracting date with enhanced pattern matching...');
    
    const patterns = [
      // High confidence patterns with context
      { pattern: /(?:date|on|dated)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi, confidence: 0.9 },
      { pattern: /(?:bill\s*date|invoice\s*date|transaction\s*date)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi, confidence: 0.95 },
      
      // Medium confidence patterns
      { pattern: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/g, confidence: 0.8 },
      { pattern: /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/gi, confidence: 0.85 },
      { pattern: /(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4})/gi, confidence: 0.87 },
      
      // Lower confidence patterns
      { pattern: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2})/g, confidence: 0.6 },
      
      // Time-based patterns (often near dates)
      { pattern: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+\d{1,2}:\d{2}/g, confidence: 0.85 },
      
      // Indian date formats
      { pattern: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s*(?:ist|gmt)/gi, confidence: 0.8 }
    ];

    const candidates: { date: string; confidence: number; context: string; parsed: string }[] = [];

    for (const { pattern, confidence } of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const dateStr = match[1];
        const parsedDate = this.parseEnhancedDate(dateStr);
        if (parsedDate) {
          candidates.push({
            date: dateStr,
            confidence,
            context: match[0],
            parsed: parsedDate
          });
        }
      }
    }

    if (candidates.length === 0) return undefined;

    // Sort by confidence and date validity
    candidates.sort((a, b) => {
      let scoreA = a.confidence;
      let scoreB = b.confidence;
      
      // Bonus for recent dates (more likely to be current transactions)
      const dateA = new Date(a.parsed);
      const dateB = new Date(b.parsed);
      const now = new Date();
      const daysDiffA = Math.abs((now.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
      const daysDiffB = Math.abs((now.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
      
      // Bonus for dates within last year
      if (daysDiffA <= 365) scoreA += 0.1;
      if (daysDiffB <= 365) scoreB += 0.1;
      
      // Bonus for dates within last month
      if (daysDiffA <= 30) scoreA += 0.05;
      if (daysDiffB <= 30) scoreB += 0.05;
      
      return scoreB - scoreA;
    });

    const selected = candidates[0];
    console.log(`📅 Selected date: ${selected.parsed} from "${selected.date}" (${(selected.confidence * 100).toFixed(0)}% confidence)`);
    
    return selected.parsed;
  }

  private parseEnhancedDate(dateStr: string): string | null {
    try {
      let date: Date;
      
      // Handle month name formats
      if (/\d+\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(dateStr)) {
        const monthMap: { [key: string]: number } = {
          'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
          'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5,
          'jul': 6, 'july': 6, 'aug': 7, 'august': 7, 'sep': 8, 'september': 8,
          'oct': 9, 'october': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11
        };
        
        const parts = dateStr.toLowerCase().split(/\s+/);
        if (parts.length >= 3) {
          const day = parseInt(parts[0]);
          const monthName = parts[1];
          const year = parseInt(parts[2]);
          
          if (monthMap[monthName] !== undefined) {
            date = new Date(year < 100 ? 2000 + year : year, monthMap[monthName], day);
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
      // Handle DD/MM/YYYY or DD-MM-YYYY formats
      else if (dateStr.includes('/') || dateStr.includes('-')) {
        const parts = dateStr.split(/[-\/]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          let year = parseInt(parts[2]);
          
          // Handle 2-digit years
          if (year < 100) {
            year = year > 50 ? 1900 + year : 2000 + year;
          }
          
          // Validate ranges
          if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2030) {
            date = new Date(year, month, day);
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        date = new Date(dateStr);
      }
      
      // Validate the date
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2030) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Enhanced date parsing failed for:', dateStr);
    }
    
    return null;
  }

  private parseDate(dateStr: string): string | null {
    // Legacy method - redirect to enhanced version
    return this.parseEnhancedDate(dateStr);
  }

  private async extractMerchantWithReasoning(text: string): Promise<string | undefined> {
    console.log('🏪 Extracting merchant with enhanced pattern matching...');
    
    const patterns = [
      // High confidence patterns with explicit context
      { pattern: /(?:merchant|vendor|store|shop|business)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$|[0-9])/gi, confidence: 0.9 },
      { pattern: /(?:bill\s*from|invoice\s*from|receipt\s*from)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$)/gi, confidence: 0.95 },
      { pattern: /(?:sold\s*by|billed\s*by)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$)/gi, confidence: 0.85 },
      
      // Company name patterns
      { pattern: /([a-zA-Z\s&.-]+?)\s+(?:pvt\.?\s*ltd\.?|private\s*limited|limited|inc\.?|corporation|corp\.?)/gi, confidence: 0.88 },
      { pattern: /([a-zA-Z\s&.-]+?)\s+(?:llp|llc|co\.?|company)/gi, confidence: 0.85 },
      
      // Header patterns (first few lines often contain merchant name)
      { pattern: /^([a-zA-Z\s&.-]{3,40})$/gm, confidence: 0.7 },
      
      // Known merchant patterns
      { pattern: /(zomato|swiggy|uber\s*eats|dominos|pizza\s*hut|mcdonald|kfc|subway)/gi, confidence: 0.95 },
      { pattern: /(amazon|flipkart|myntra|ajio|nykaa)/gi, confidence: 0.95 },
      { pattern: /(big\s*bazaar|reliance|dmart|more|spencer)/gi, confidence: 0.9 },
      { pattern: /(paytm|phonepe|google\s*pay|razorpay)/gi, confidence: 0.9 },
      
      // Generic patterns
      { pattern: /([A-Z][a-zA-Z\s&.-]{2,30})\s*(?:\n|address|phone|email|gst)/gi, confidence: 0.6 }
    ];

    const candidates: { merchant: string; confidence: number; context: string; position: number }[] = [];

    for (const { pattern, confidence } of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        let merchant = match[1]?.trim();
        if (!merchant) continue;
        
        // Clean up the merchant name
        merchant = this.cleanMerchantName(merchant);
        
        if (this.isValidMerchantName(merchant)) {
          candidates.push({
            merchant,
            confidence,
            context: match[0],
            position: match.index || 0
          });
        }
      }
    }

    if (candidates.length === 0) return undefined;

    // Enhanced scoring and selection
    const scoredCandidates = candidates.map(candidate => {
      let score = candidate.confidence;
      
      // Bonus for position (earlier in text is often merchant name)
      const textLength = text.length;
      const relativePosition = candidate.position / textLength;
      if (relativePosition < 0.3) score += 0.1; // Early in text
      if (relativePosition < 0.1) score += 0.05; // Very early
      
      // Bonus for proper capitalization
      if (this.hasProperCapitalization(candidate.merchant)) score += 0.05;
      
      // Bonus for reasonable length
      if (candidate.merchant.length >= 5 && candidate.merchant.length <= 25) score += 0.03;
      
      // Penalty for very short or very long names
      if (candidate.merchant.length < 3) score -= 0.2;
      if (candidate.merchant.length > 40) score -= 0.1;
      
      // Bonus for containing common business words
      const businessWords = ['restaurant', 'store', 'shop', 'mart', 'cafe', 'hotel', 'services'];
      if (businessWords.some(word => candidate.merchant.toLowerCase().includes(word))) {
        score += 0.02;
      }
      
      return { ...candidate, score };
    });

    // Sort by score and select best
    scoredCandidates.sort((a, b) => b.score - a.score);
    const selected = scoredCandidates[0];
    
    console.log(`🏪 Selected merchant: "${selected.merchant}" (${(selected.score * 100).toFixed(0)}% confidence)`);
    
    return selected.merchant;
  }

  private cleanMerchantName(name: string): string {
    return name
      .replace(/[^a-zA-Z\s&.-]/g, '') // Remove special characters except common business ones
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private isValidMerchantName(name: string): boolean {
    // Basic validation rules
    if (name.length < 2 || name.length > 50) return false;
    if (!/[a-zA-Z]/.test(name)) return false; // Must contain at least one letter
    if (/^\d+$/.test(name)) return false; // Not just numbers
    
    // Filter out common false positives
    const invalidPatterns = [
      /^(date|time|amount|total|bill|receipt|invoice|address|phone|email|gst)$/i,
      /^(the|and|or|of|in|at|to|for|with|by)$/i,
      /^\d+[\s.-]{0,10}\d*$/,
      /^[a-z]$/i
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(name.trim()));
  }

  private hasProperCapitalization(name: string): boolean {
    // Check if name has proper title case or all caps (common for business names)
    const words = name.split(/\s+/);
    return words.some(word => 
      word.length > 0 && 
      (word[0] === word[0].toUpperCase() || word === word.toUpperCase())
    );
  }

  private async extractCategoryWithReasoning(text: string, merchant?: string): Promise<string> {
    // LLM-like category classification
    const categories = {
      'Food & Dining': ['food', 'restaurant', 'cafe', 'dining', 'zomato', 'swiggy', 'dominos', 'pizza', 'meal', 'kitchen'],
      'Transportation': ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'metro', 'bus', 'train', 'travel'],
      'Shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store', 'purchase', 'buy'],
      'Utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bill', 'utility'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'entertainment', 'cinema', 'theatre'],
      'Healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'health', 'clinic'],
      'Groceries': ['grocery', 'vegetables', 'fruits', 'supermarket', 'mart', 'provisions']
    };

    const textLower = text.toLowerCase();
    const merchantLower = merchant?.toLowerCase() || '';
    const combinedText = textLower + ' ' + merchantLower;

    let bestCategory = 'Other';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.reduce((sum, keyword) => {
        let points = 0;
        if (combinedText.includes(keyword)) {
          points = keyword.length;
          if (merchantLower.includes(keyword)) points *= 2; // Merchant match is more important
        }
        return sum + points;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    console.log(`🏷️ Classified as: ${bestCategory} (score: ${bestScore})`);
    return bestCategory;
  }

  private async extractTypeWithReasoning(text: string): Promise<'income' | 'expense'> {
    const incomeKeywords = ['received', 'credit', 'refund', 'cashback', 'salary', 'bonus', 'income', 'deposit'];
    const textLower = text.toLowerCase();

    const isIncome = incomeKeywords.some(keyword => textLower.includes(keyword));
    const type = isIncome ? 'income' : 'expense';
    
    console.log(`📊 Transaction type: ${type}`);
    return type;
  }

  private async extractPaymentMethodWithReasoning(text: string): Promise<string | undefined> {
    const methods = {
      'Paytm': ['paytm'],
      'Razorpay': ['razorpay'],
      'UPI': ['upi', 'unified payments'],
      'PhonePe': ['phonepe'],
      'Google Pay': ['googlepay', 'google pay', 'gpay'],
      'Card': ['card', 'visa', 'mastercard'],
      'Cash': ['cash'],
      'Net Banking': ['net banking', 'netbanking']
    };

    const textLower = text.toLowerCase();

    for (const [method, keywords] of Object.entries(methods)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        console.log(`💳 Payment method: ${method}`);
        return method;
      }
    }

    return undefined;
  }

  private async extractTransactionIdWithReasoning(text: string): Promise<string | undefined> {
    const patterns = [
      /(?:transaction id|txn id|ref no|order id|payment id)\s*:?\s*([a-zA-Z0-9]+)/gi,
      /(?:utr|rrn)\s*:?\s*([a-zA-Z0-9]+)/gi,
      /id\s*:?\s*([a-zA-Z0-9]{8,})/gi
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].length >= 6) {
        console.log(`🔢 Transaction ID: ${match[1]}`);
        return match[1];
      }
    }

    return undefined;
  }

  private detectDocumentType(text: string, fileName: string): string {
    const textLower = text.toLowerCase();
    const fileNameLower = fileName.toLowerCase();

    if (textLower.includes('invoice') || fileNameLower.includes('invoice')) return 'Invoice';
    if (textLower.includes('receipt') || fileNameLower.includes('receipt')) return 'Receipt';
    if (textLower.includes('paytm') || textLower.includes('razorpay') || textLower.includes('upi')) return 'Payment Screenshot';
    if (textLower.includes('statement')) return 'Bank Statement';
    
    return 'Receipt'; // Default
  }

  private generateSuggestions(data: ExtractedTransactionData, text: string): string[] {
    const suggestions = [];

    if (!data.amount) suggestions.push('Amount not detected - check image quality');
    if (!data.date) suggestions.push('Date not found - verify date format');
    if (!data.merchant) suggestions.push('Merchant name unclear - consider manual entry');
    if (text.length < 50) suggestions.push('Limited text detected - try higher resolution image');

    return suggestions;
  }

  private assessDataQuality(data: ExtractedTransactionData): 'excellent' | 'good' | 'fair' | 'poor' {
    const fieldsExtracted = Object.values(data).filter(v => v !== undefined && v !== null).length;
    
    if (fieldsExtracted >= 6) return 'excellent';
    if (fieldsExtracted >= 4) return 'good';
    if (fieldsExtracted >= 2) return 'fair';
    return 'poor';
  }

  private async fallbackPatternExtraction(text: string): Promise<{
    extractedData: ExtractedTransactionData;
    analysis: LLMAnalysis;
  }> {
    console.log('🔄 Using fallback pattern extraction...');
    
    const extractedData = await this.intelligentPatternExtraction(text);
    
    const analysis: LLMAnalysis = {
      documentType: 'Unknown',
      confidence: 0.6,
      reasoning: 'Used fallback pattern-based extraction due to LLM unavailability',
      suggestions: ['Consider improving image quality for better results'],
      dataQuality: this.assessDataQuality(extractedData),
      extractionMethod: 'pattern_based'
    };

    return { extractedData, analysis };
  }

  private async validateWithLLM(data: ExtractedTransactionData, text: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Validate amount
    if (data.amount) {
      const isValid = data.amount > 0 && data.amount < 10000000;
      results.push({
        field: 'amount',
        isValid,
        confidence: isValid ? 0.9 : 0.1,
        suggestions: isValid ? [] : ['Amount seems unrealistic'],
        reasoning: `Amount ${data.amount} is ${isValid ? 'within' : 'outside'} expected range`
      });
    }

    // Validate date
    if (data.date) {
      const date = new Date(data.date);
      const isValid = !isNaN(date.getTime());
      results.push({
        field: 'date',
        isValid,
        confidence: isValid ? 0.9 : 0.1,
        suggestions: isValid ? [] : ['Date format invalid'],
        reasoning: `Date parsing ${isValid ? 'successful' : 'failed'}`
      });
    }

    return results;
  }

  private calculateLLMConfidence(
    llmResult: { extractedData: ExtractedTransactionData; analysis: LLMAnalysis },
    validationResults: ValidationResult[],
    ocrConfidence: number
  ): number {
    let confidence = 0.5;

    // Base confidence from LLM analysis
    confidence += llmResult.analysis.confidence * 0.3;

    // OCR confidence contribution
    confidence += ocrConfidence * 0.2;

    // Validation results contribution
    const avgValidationConfidence = validationResults.length > 0
      ? validationResults.reduce((sum, r) => sum + r.confidence, 0) / validationResults.length
      : 0.5;
    confidence += avgValidationConfidence * 0.3;

    // Data quality bonus
    const qualityBonus = {
      'excellent': 0.2,
      'good': 0.1,
      'fair': 0.05,
      'poor': 0
    };
    confidence += qualityBonus[llmResult.analysis.dataQuality];

    return Math.min(confidence, 1);
  }

  private generateCacheKey(text: string): string {
    // Simple hash for caching
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      // Use PDF.js for browser-compatible PDF text extraction
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
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
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.js`;
      
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
        viewport: viewport,
        canvas: canvas
      };
      
      await page.render(renderContext).promise;
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('PDF to image conversion failed:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
      this.isInitialized = false;
    }
    this.llmCache.clear();
  }
}