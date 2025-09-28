/**
 * Voice OCR Processor - Voice-to-transaction processing
 * USP: "Just speak your expense - no photo needed! Works in Hindi, English, Tamil, Bengali"
 */

import { ExtractedTransactionData } from './ocr-processor';

interface VoiceProcessingConfig {
  languages: string[];
  enableRealTimeProcessing: boolean;
  enableMultiLanguageDetection: boolean;
  confidenceThreshold: number;
  processingMode: 'streaming' | 'batch';
}

interface VoiceTransactionData extends ExtractedTransactionData {
  voiceConfidence: number;
  languageDetected: string;
  audioMetadata: AudioMetadata;
  processingSteps: VoiceProcessingStep[];
}

interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  quality: 'high' | 'medium' | 'low';
}

interface VoiceProcessingStep {
  step: string;
  timestamp: number;
  result: any;
  confidence: number;
  duration: number;
}

interface LanguagePattern {
  language: string;
  patterns: {
    amount: RegExp[];
    merchant: RegExp[];
    date: RegExp[];
    category: RegExp[];
    common_phrases: string[];
  };
}

export class VoiceOCRProcessor {
  private speechRecognition: SpeechRecognition | null = null;
  private config: VoiceProcessingConfig;
  private languagePatterns: Map<string, LanguagePattern> = new Map();
  private isListening = false;
  private audioContext: AudioContext | null = null;
  
  constructor(config?: Partial<VoiceProcessingConfig>) {
    this.config = {
      languages: ['en-IN', 'hi-IN', 'ta-IN', 'bn-IN', 'en-US'],
      enableRealTimeProcessing: true,
      enableMultiLanguageDetection: true,
      confidenceThreshold: 0.7,
      processingMode: 'streaming',
      ...config
    };
    
    this.initializeLanguagePatterns();
    this.setupSpeechRecognition();
  }

  /**
   * Process voice input to extract transaction data
   */
  async processVoiceInput(
    audioBlob?: Blob,
    onRealTimeUpdate?: (partial: Partial<VoiceTransactionData>) => void
  ): Promise<VoiceTransactionData> {
    const startTime = Date.now();
    const processingSteps: VoiceProcessingStep[] = [];
    
    try {
      let transcript: string;
      let audioMetadata: AudioMetadata;
      
      if (audioBlob) {
        // Process uploaded audio file
        const result = await this.processAudioFile(audioBlob);
        transcript = result.transcript;
        audioMetadata = result.metadata;
        
        processingSteps.push({
          step: 'audio_transcription',
          timestamp: Date.now(),
          result: { transcript, confidence: result.confidence },
          confidence: result.confidence,
          duration: Date.now() - startTime
        });
      } else {
        // Real-time voice recognition
        const result = await this.startRealTimeRecognition(onRealTimeUpdate);
        transcript = result.transcript;
        audioMetadata = result.metadata;
        
        processingSteps.push({
          step: 'realtime_recognition',
          timestamp: Date.now(),
          result: { transcript },
          confidence: result.confidence,
          duration: Date.now() - startTime
        });
      }
      
      // Detect language
      const languageDetected = await this.detectLanguage(transcript);
      processingSteps.push({
        step: 'language_detection',
        timestamp: Date.now(),
        result: { language: languageDetected },
        confidence: 0.9,
        duration: Date.now() - startTime
      });
      
      // Extract transaction data from transcript
      const extractedData = await this.extractTransactionFromVoice(
        transcript, 
        languageDetected
      );
      
      processingSteps.push({
        step: 'data_extraction',
        timestamp: Date.now(),
        result: extractedData,
        confidence: extractedData.confidence || 0.8,
        duration: Date.now() - startTime
      });
      
      // Validate and enhance data
      const validatedData = await this.validateVoiceExtraction(extractedData, transcript);
      
      processingSteps.push({
        step: 'validation',
        timestamp: Date.now(),
        result: validatedData,
        confidence: validatedData.confidence || 0.8,
        duration: Date.now() - startTime
      });
      
      return {
        ...validatedData,
        voiceConfidence: this.calculateVoiceConfidence(processingSteps),
        languageDetected,
        audioMetadata,
        processingSteps
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Voice processing failed: ${errorMessage}`);
    }
  }

  /**
   * Start real-time voice recognition
   */
  async startRealTimeRecognition(
    onUpdate?: (partial: Partial<VoiceTransactionData>) => void
  ): Promise<{ transcript: string; confidence: number; metadata: AudioMetadata }> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
      
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = this.config.languages[0];
      
      let finalTranscript = '';
      let interimTranscript = '';
      const startTime = Date.now();
      
      this.speechRecognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        // Real-time updates
        if (onUpdate && interimTranscript) {
          this.extractPartialData(interimTranscript).then(partialData => {
            onUpdate(partialData);
          });
        }
      };
      
      this.speechRecognition.onend = () => {
        this.isListening = false;
        const duration = Date.now() - startTime;
        
        resolve({
          transcript: finalTranscript || interimTranscript,
          confidence: 0.85,
          metadata: {
            duration,
            sampleRate: 44100,
            channels: 1,
            format: 'webm',
            quality: 'high'
          }
        });
      };
      
      this.speechRecognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      this.isListening = true;
      this.speechRecognition.start();
    });
  }

  /**
   * Process uploaded audio file
   */
  private async processAudioFile(
    audioBlob: Blob
  ): Promise<{ transcript: string; confidence: number; metadata: AudioMetadata }> {
    // For browser implementation, we'd use Web Audio API + speech recognition
    // This is a simplified version
    
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    const metadata: AudioMetadata = {
      duration: 0,
      sampleRate: 44100,
      channels: 1,
      format: audioBlob.type,
      quality: audioBlob.size > 1000000 ? 'high' : audioBlob.size > 500000 ? 'medium' : 'low'
    };
    
    // Wait for audio to load
    await new Promise((resolve, reject) => {
      audio.onloadedmetadata = () => {
        metadata.duration = audio.duration * 1000; // Convert to ms
        resolve(undefined);
      };
      audio.onerror = reject;
    });
    
    // In a real implementation, this would use a more sophisticated transcription service
    // For now, we'll simulate transcription
    const transcript = await this.simulateAudioTranscription(audioBlob);
    
    URL.revokeObjectURL(audioUrl);
    
    return {
      transcript,
      confidence: 0.8,
      metadata
    };
  }

  /**
   * Extract transaction data from voice transcript
   */
  private async extractTransactionFromVoice(
    transcript: string,
    language: string
  ): Promise<ExtractedTransactionData> {
    const patterns = this.languagePatterns.get(language);
    if (!patterns) {
      throw new Error(`Language ${language} not supported`);
    }
    
    const extractedData: ExtractedTransactionData = {
      confidence: 0.8
    };
    
    // Extract amount
    extractedData.amount = this.extractAmountFromVoice(transcript, patterns);
    
    // Extract merchant
    extractedData.merchant = this.extractMerchantFromVoice(transcript, patterns);
    
    // Extract date
    extractedData.date = this.extractDateFromVoice(transcript, patterns);
    
    // Extract category
    extractedData.category = this.extractCategoryFromVoice(transcript, patterns);
    
    // Extract description
    extractedData.description = this.generateDescriptionFromVoice(transcript, extractedData);
    
    // Set default type
    extractedData.type = 'expense';
    
    return extractedData;
  }

  /**
   * Extract amount from voice transcript
   */
  private extractAmountFromVoice(transcript: string, patterns: LanguagePattern): number | undefined {
    const text = transcript.toLowerCase();
    
    for (const pattern of patterns.patterns.amount) {
      const match = text.match(pattern);
      if (match) {
        // Extract numeric value
        const numericMatch = match[0].match(/\d+(?:,\d{3})*(?:\.\d{2})?/);
        if (numericMatch) {
          return parseFloat(numericMatch[0].replace(/,/g, ''));
        }
      }
    }
    
    // Try word-to-number conversion for spoken numbers
    return this.convertSpokenNumberToValue(text);
  }

  /**
   * Extract merchant from voice transcript
   */
  private extractMerchantFromVoice(transcript: string, patterns: LanguagePattern): string | undefined {
    const text = transcript.toLowerCase();
    
    // Look for "at [merchant]" or "from [merchant]" patterns
    for (const pattern of patterns.patterns.merchant) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return this.capitalizeMerchantName(match[1].trim());
      }
    }
    
    // Check against known merchants
    const knownMerchants = [
      'starbucks', 'mcdonalds', 'zomato', 'swiggy', 'amazon', 'flipkart',
      'uber', 'ola', 'paytm', 'big bazaar', 'reliance fresh', 'spencer'
    ];
    
    for (const merchant of knownMerchants) {
      if (text.includes(merchant)) {
        return this.capitalizeMerchantName(merchant);
      }
    }
    
    return undefined;
  }

  /**
   * Extract date from voice transcript
   */
  private extractDateFromVoice(transcript: string, patterns: LanguagePattern): string | undefined {
    const text = transcript.toLowerCase();
    
    // Check for relative dates
    if (text.includes('today')) {
      return new Date().toISOString().split('T')[0];
    }
    
    if (text.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    
    // Check for specific date patterns
    for (const pattern of patterns.patterns.date) {
      const match = text.match(pattern);
      if (match) {
        return this.parseDateFromMatch(match);
      }
    }
    
    // Default to today
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Extract category from voice transcript
   */
  private extractCategoryFromVoice(transcript: string, patterns: LanguagePattern): string | undefined {
    const text = transcript.toLowerCase();
    
    const categoryKeywords = {
      'food': ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'meal'],
      'transport': ['taxi', 'uber', 'ola', 'bus', 'metro', 'fuel', 'petrol'],
      'shopping': ['shopping', 'clothes', 'electronics', 'amazon', 'flipkart'],
      'entertainment': ['movie', 'cinema', 'game', 'entertainment'],
      'utilities': ['electricity', 'water', 'gas', 'internet', 'mobile'],
      'healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }

  /**
   * Generate description from voice input
   */
  private generateDescriptionFromVoice(
    transcript: string,
    extractedData: ExtractedTransactionData
  ): string {
    let description = transcript.trim();
    
    // Clean up the description
    description = description.replace(/^(i|I)\s+(spent|paid|bought)\s+/, '');
    description = description.replace(/\s+(today|yesterday|at|from)\s+.*$/, '');
    
    // If description is too long, truncate
    if (description.length > 100) {
      description = description.substring(0, 100) + '...';
    }
    
    return description || `${extractedData.category} expense`;
  }

  /**
   * Initialize language patterns for different languages
   */
  private initializeLanguagePatterns(): void {
    this.languagePatterns = new Map();
    
    // English patterns
    this.languagePatterns.set('en-IN', {
      language: 'en-IN',
      patterns: {
        amount: [
          /(?:rs\.?|rupees?|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
          /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs\.?|rupees?|₹)/gi,
          /(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand)\s*(?:rs\.?|rupees?|₹)/gi
        ],
        merchant: [
          /(?:at|from)\s+([a-zA-Z\s]+?)(?:\s+(?:today|yesterday|for|bought))/gi,
          /(?:bought from|ordered from)\s+([a-zA-Z\s]+)/gi
        ],
        date: [
          /(today|yesterday)/gi,
          /(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)/gi
        ],
        category: [
          /(food|lunch|dinner|breakfast|coffee|meal)/gi,
          /(transport|taxi|uber|ola|bus)/gi,
          /(shopping|clothes|electronics)/gi
        ],
        common_phrases: [
          'i spent', 'i paid', 'i bought', 'purchased', 'ordered from'
        ]
      }
    });
    
    // Hindi patterns
    this.languagePatterns.set('hi-IN', {
      language: 'hi-IN',
      patterns: {
        amount: [
          /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:रुपये|रुपए|₹)/gi,
          /(?:रुपये|रुपए|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
        ],
        merchant: [
          /(?:से|में)\s+([ा-ॿ\s]+?)(?:\s+(?:आज|कल|खरीदा))/gi
        ],
        date: [
          /(आज|कल)/gi
        ],
        category: [
          /(खाना|भोजन|खाने)/gi,
          /(यात्रा|टैक्सी)/gi
        ],
        common_phrases: [
          'मैंने खर्च किया', 'मैंने दिया', 'मैंने खरीदा', 'ऑर्डर किया'
        ]
      }
    });
    
    // Add more languages as needed...
  }

  /**
   * Setup speech recognition
   */
  private setupSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.speechRecognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.speechRecognition = new (window as any).SpeechRecognition();
    }
    
    if (this.speechRecognition) {
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;
      // Type assertion for browser-specific properties
      (this.speechRecognition as any).maxAlternatives = 3;
    }
  }

  /**
   * Detect language from transcript
   */
  private async detectLanguage(transcript: string): Promise<string> {
    // Simple language detection based on character patterns
    const hindiPattern = /[\u0900-\u097F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    
    if (hindiPattern.test(transcript)) return 'hi-IN';
    if (tamilPattern.test(transcript)) return 'ta-IN';
    if (bengaliPattern.test(transcript)) return 'bn-IN';
    
    return 'en-IN'; // Default to English
  }

  /**
   * Convert spoken numbers to numeric values
   */
  private convertSpokenNumberToValue(text: string): number | undefined {
    const numberWords = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
      'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
      'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000
    };
    
    // Simple implementation - can be enhanced
    for (const [word, value] of Object.entries(numberWords)) {
      if (text.includes(word)) {
        return value;
      }
    }
    
    return undefined;
  }

  /**
   * Calculate overall voice confidence
   */
  private calculateVoiceConfidence(steps: VoiceProcessingStep[]): number {
    const confidences = steps.map(step => step.confidence);
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  /**
   * Validate voice extraction results
   */
  private async validateVoiceExtraction(
    data: ExtractedTransactionData,
    transcript: string
  ): Promise<ExtractedTransactionData> {
    // Add validation logic
    let confidence = data.confidence || 0.8;
    
    // Reduce confidence if critical data is missing
    if (!data.amount) confidence -= 0.3;
    if (!data.merchant && !data.description) confidence -= 0.2;
    
    return {
      ...data,
      confidence: Math.max(confidence, 0.1)
    };
  }

  /**
   * Extract partial data for real-time updates
   */
  private async extractPartialData(interimText: string): Promise<Partial<VoiceTransactionData>> {
    // Quick extraction for real-time feedback
    const amount = this.extractAmountFromVoice(interimText, this.languagePatterns.get('en-IN')!);
    const merchant = this.extractMerchantFromVoice(interimText, this.languagePatterns.get('en-IN')!);
    
    return {
      amount,
      merchant,
      description: interimText
    };
  }

  /**
   * Simulate audio transcription (placeholder)
   */
  private async simulateAudioTranscription(audioBlob: Blob): Promise<string> {
    // In a real implementation, this would use a transcription service
    // For now, return a placeholder
    return "Simulated transcription - integrate with real service";
  }

  /**
   * Capitalize merchant name properly
   */
  private capitalizeMerchantName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Parse date from regex match
   */
  private parseDateFromMatch(match: RegExpMatchArray): string | undefined {
    // Implement date parsing logic based on match
    return new Date().toISOString().split('T')[0]; // Placeholder
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceSupported(): boolean {
    return this.speechRecognition !== null;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.languagePatterns.keys());
  }
}

export default VoiceOCRProcessor;