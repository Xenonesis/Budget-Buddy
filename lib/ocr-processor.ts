import { createWorker } from 'tesseract.js';

export interface ExtractedTransactionData {
  amount?: number;
  description?: string;
  date?: string;
  merchant?: string;
  category?: string;
  type?: 'income' | 'expense';
  confidence?: number;
}

export class OCRProcessor {
  private worker: any = null;

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
  }

  async processImage(file: File): Promise<ExtractedTransactionData> {
    try {
      await this.initialize();
      
      // Convert file to image data
      const imageData = await this.fileToImageData(file);
      
      // Perform OCR
      const { data: { text } } = await this.worker.recognize(imageData);
      
      // Extract transaction data from text
      return this.extractTransactionData(text);
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async processPDF(file: File): Promise<ExtractedTransactionData> {
    try {
      // For PDF processing, we'll need to convert to image first
      // This is a simplified approach - in production you might want to use pdf2pic
      const text = await this.extractTextFromPDF(file);
      return this.extractTransactionData(text);
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error('Failed to process PDF');
    }
  }

  private async fileToImageData(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    // Simplified PDF text extraction
    // In a real implementation, you'd use pdf-parse or similar
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // This is a placeholder - you'd need proper PDF parsing
          const text = reader.result as string;
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private extractTransactionData(text: string): ExtractedTransactionData {
    const result: ExtractedTransactionData = {};
    
    // Clean and normalize text
    const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Extract amount using various patterns
    const amountPatterns = [
      /(?:rs\.?|₹|inr)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs\.?|₹|inr)/i,
      /amount[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /total[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /paid[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i
    ];

    for (const pattern of amountPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        result.amount = parseFloat(amountStr);
        break;
      }
    }

    // Extract date patterns
    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i,
      /(?:date|on)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i
    ];

    for (const pattern of datePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        result.date = match[1];
        break;
      }
    }

    // Extract merchant/vendor information
    const merchantPatterns = [
      /(?:merchant|vendor|store|shop)[:\s]*([a-zA-Z\s]+?)(?:\n|$|[0-9])/i,
      /(?:from|to)[:\s]*([a-zA-Z\s]+?)(?:\n|$|[0-9])/i
    ];

    for (const pattern of merchantPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        result.merchant = match[1].trim();
        break;
      }
    }

    // Detect payment apps and extract relevant info
    if (cleanText.includes('paytm')) {
      result.description = this.extractPaytmInfo(cleanText);
      result.category = 'Digital Payment';
    } else if (cleanText.includes('razorpay')) {
      result.description = this.extractRazorpayInfo(cleanText);
      result.category = 'Digital Payment';
    } else if (cleanText.includes('upi')) {
      result.description = this.extractUPIInfo(cleanText);
      result.category = 'UPI Transfer';
    }

    // Determine transaction type (default to expense)
    result.type = 'expense';
    if (cleanText.includes('credit') || cleanText.includes('received') || cleanText.includes('refund')) {
      result.type = 'income';
    }

    // Auto-categorize based on keywords
    if (!result.category) {
      result.category = this.categorizeTransaction(cleanText);
    }

    // Set confidence based on how much data we extracted
    const extractedFields = Object.keys(result).filter(key => result[key as keyof ExtractedTransactionData] !== undefined).length;
    result.confidence = Math.min(extractedFields / 5, 1) * 100; // Max 100%

    return result;
  }

  private extractPaytmInfo(text: string): string {
    const patterns = [
      /paytm\s+transaction[:\s]*([^\n]+)/i,
      /paid\s+to[:\s]*([^\n]+)/i,
      /transaction\s+id[:\s]*([^\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return `Paytm: ${match[1].trim()}`;
      }
    }
    return 'Paytm Transaction';
  }

  private extractRazorpayInfo(text: string): string {
    const patterns = [
      /razorpay\s+payment[:\s]*([^\n]+)/i,
      /payment\s+to[:\s]*([^\n]+)/i,
      /order\s+id[:\s]*([^\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return `Razorpay: ${match[1].trim()}`;
      }
    }
    return 'Razorpay Payment';
  }

  private extractUPIInfo(text: string): string {
    const patterns = [
      /upi\s+(?:id|ref)[:\s]*([^\n]+)/i,
      /(?:paid|sent)\s+to[:\s]*([^\n]+)/i,
      /transaction\s+ref[:\s]*([^\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return `UPI: ${match[1].trim()}`;
      }
    }
    return 'UPI Transaction';
  }

  private categorizeTransaction(text: string): string {
    const categories = {
      'Food & Dining': ['restaurant', 'food', 'cafe', 'dining', 'zomato', 'swiggy', 'dominos', 'pizza'],
      'Transportation': ['uber', 'ola', 'taxi', 'metro', 'bus', 'fuel', 'petrol', 'diesel'],
      'Shopping': ['amazon', 'flipkart', 'shopping', 'mall', 'store', 'purchase'],
      'Utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game'],
      'Healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical'],
      'Education': ['school', 'college', 'course', 'book', 'education'],
      'Groceries': ['grocery', 'supermarket', 'vegetables', 'fruits', 'milk']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}