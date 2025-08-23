export interface TestCase {
  id: string;
  name: string;
  description: string;
  expectedData: {
    amount: number;
    date: string;
    merchant?: string;
    category: string;
    type: 'income' | 'expense';
    paymentMethod?: string;
  };
  testImageData?: string; // Base64 or URL
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export class OCRTestSuite {
  private testCases: TestCase[] = [
    {
      id: 'paytm-basic',
      name: 'Paytm Food Order',
      description: 'Clear Paytm screenshot for Zomato food order',
      expectedData: {
        amount: 450.50,
        date: '2024-01-15',
        merchant: 'Zomato',
        category: 'Food & Dining',
        type: 'expense',
        paymentMethod: 'Paytm'
      },
      difficulty: 'easy'
    },
    {
      id: 'razorpay-complex',
      name: 'Razorpay E-commerce',
      description: 'Razorpay payment for Amazon purchase with multiple items',
      expectedData: {
        amount: 2599.99,
        date: '2024-01-14',
        merchant: 'Amazon',
        category: 'Shopping',
        type: 'expense',
        paymentMethod: 'Razorpay'
      },
      difficulty: 'medium'
    },
    {
      id: 'upi-transfer',
      name: 'UPI Money Transfer',
      description: 'UPI transfer screenshot with transaction ID',
      expectedData: {
        amount: 5000.00,
        date: '2024-01-13',
        merchant: 'John Doe',
        category: 'Transfer',
        type: 'expense',
        paymentMethod: 'UPI'
      },
      difficulty: 'medium'
    },
    {
      id: 'bank-statement',
      name: 'Bank Statement Entry',
      description: 'PDF bank statement with salary credit',
      expectedData: {
        amount: 75000.00,
        date: '2024-01-01',
        merchant: 'Tech Corp Ltd',
        category: 'Salary',
        type: 'income',
        paymentMethod: 'Bank Transfer'
      },
      difficulty: 'hard'
    },
    {
      id: 'handwritten-receipt',
      name: 'Handwritten Receipt',
      description: 'Handwritten restaurant bill with poor image quality',
      expectedData: {
        amount: 1250.75,
        date: '2024-01-12',
        merchant: 'Local Restaurant',
        category: 'Food & Dining',
        type: 'expense'
      },
      difficulty: 'extreme'
    }
  ];

  async runTestSuite(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of this.testCases) {
      console.log(`Running test: ${testCase.name}`);
      const result = await this.runSingleTest(testCase);
      results.push(result);
    }
    
    return results;
  }

  async runSingleTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Create a real test image with the expected data
      const testFile = await this.createRealTestFile(testCase);
      
      // Use the actual OCR processor
      const { AdvancedOCRProcessor } = await import('./advanced-ocr-processor');
      const processor = new AdvancedOCRProcessor();
      const result = await processor.processDocument(testFile);
      
      const accuracy = this.calculateAccuracy(testCase.expectedData, result.data);
      
      return {
        testId: testCase.id,
        testName: testCase.name,
        passed: accuracy >= 0.95, // 95% accuracy threshold
        accuracy,
        extractedData: result.data,
        expectedData: testCase.expectedData,
        confidence: result.confidence,
        processingTime: Date.now() - startTime,
        errors: accuracy < 0.95 ? this.identifyErrors(testCase.expectedData, result.data) : []
      };
    } catch (error) {
      return {
        testId: testCase.id,
        testName: testCase.name,
        passed: false,
        accuracy: 0,
        extractedData: {},
        expectedData: testCase.expectedData,
        confidence: 0,
        processingTime: 0,
        errors: [`Test execution failed: ${error}`]
      };
    }
  }

  private async createRealTestFile(testCase: TestCase): Promise<File> {
    // Create a real image file with the test data rendered as text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    canvas.width = 600;
    canvas.height = 400;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Black text
    ctx.fillStyle = 'black';
    ctx.font = '18px Arial';
    
    const data = testCase.expectedData;
    let y = 50;
    
    // Render transaction data as text that OCR can read
    if (data.merchant) {
      ctx.fillText(`Merchant: ${data.merchant}`, 50, y);
      y += 30;
    }
    
    ctx.fillText(`Amount: ₹${data.amount}`, 50, y);
    y += 30;
    
    ctx.fillText(`Date: ${data.date}`, 50, y);
    y += 30;
    
    if (data.paymentMethod) {
      ctx.fillText(`Payment Method: ${data.paymentMethod}`, 50, y);
      y += 30;
    }
    
    ctx.fillText(`Transaction Type: ${data.type}`, 50, y);
    y += 30;
    
    ctx.fillText(`Category: ${data.category}`, 50, y);
    
    // Add some noise based on difficulty
    if (testCase.difficulty !== 'easy') {
      this.addImageNoise(ctx, canvas, testCase.difficulty);
    }
    
    // Convert canvas to blob and then to File
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${testCase.id}.png`, { type: 'image/png' });
          resolve(file);
        } else {
          throw new Error('Failed to create test file');
        }
      }, 'image/png');
    });
  }

  private addImageNoise(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, difficulty: string) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let noiseLevel = 0;
    switch (difficulty) {
      case 'medium': noiseLevel = 10; break;
      case 'hard': noiseLevel = 20; break;
      case 'extreme': noiseLevel = 35; break;
    }
    
    // Add random noise
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseLevel / 100) {
        const noise = Math.random() * 100;
        data[i] = Math.max(0, Math.min(255, data[i] + noise - 50));     // Red
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise - 50)); // Green
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise - 50)); // Blue
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }


  private calculateAccuracy(expected: any, extracted: any): number {
    const fields = ['amount', 'date', 'merchant', 'category', 'type', 'paymentMethod'];
    let correctFields = 0;
    let totalFields = 0;
    
    for (const field of fields) {
      if (expected[field] !== undefined) {
        totalFields++;
        if (field === 'amount') {
          // Allow 1% variance for amounts
          const variance = Math.abs(expected[field] - (extracted[field] || 0)) / expected[field];
          if (variance <= 0.01) correctFields++;
        } else {
          if (expected[field] === extracted[field]) correctFields++;
        }
      }
    }
    
    return totalFields > 0 ? correctFields / totalFields : 0;
  }

  private identifyErrors(expected: any, extracted: any): string[] {
    const errors: string[] = [];
    
    if (expected.amount !== extracted.amount) {
      errors.push(`Amount mismatch: expected ${expected.amount}, got ${extracted.amount}`);
    }
    
    if (expected.date !== extracted.date) {
      errors.push(`Date mismatch: expected ${expected.date}, got ${extracted.date}`);
    }
    
    if (expected.merchant !== extracted.merchant) {
      errors.push(`Merchant mismatch: expected ${expected.merchant}, got ${extracted.merchant}`);
    }
    
    if (expected.category !== extracted.category) {
      errors.push(`Category mismatch: expected ${expected.category}, got ${extracted.category}`);
    }
    
    return errors;
  }

  generateTestReport(results: TestResult[]): TestReport {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalTests;
    const averageProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / totalTests;
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: passedTests / totalTests,
      averageAccuracy,
      averageConfidence,
      averageProcessingTime,
      results,
      timestamp: new Date().toISOString()
    };
  }
}

export interface TestResult {
  testId: string;
  testName: string;
  passed: boolean;
  accuracy: number;
  extractedData: any;
  expectedData: any;
  confidence: number;
  processingTime: number;
  errors: string[];
}

export interface TestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  averageAccuracy: number;
  averageConfidence: number;
  averageProcessingTime: number;
  results: TestResult[];
  timestamp: string;
}