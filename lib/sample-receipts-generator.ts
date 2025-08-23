export interface SampleReceipt {
  id: string;
  name: string;
  type: 'restaurant' | 'grocery' | 'fuel' | 'shopping' | 'payment_app' | 'invoice';
  expectedData: {
    amount: number;
    merchant: string;
    date: string;
    category: string;
    paymentMethod?: string;
    transactionId?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export class SampleReceiptGenerator {
  
  static getSampleReceipts(): SampleReceipt[] {
    return [
      {
        id: 'zomato_order',
        name: 'Zomato Food Order',
        type: 'restaurant',
        expectedData: {
          amount: 450.50,
          merchant: 'Dominos Pizza',
          date: '2024-01-15',
          category: 'Food & Dining',
          paymentMethod: 'UPI',
          transactionId: 'ZOM123456789'
        },
        difficulty: 'easy'
      },
      {
        id: 'grocery_bill',
        name: 'Grocery Store Receipt',
        type: 'grocery',
        expectedData: {
          amount: 1250.75,
          merchant: 'Big Bazaar',
          date: '2024-01-14',
          category: 'Groceries',
          paymentMethod: 'Card'
        },
        difficulty: 'medium'
      },
      {
        id: 'fuel_receipt',
        name: 'Petrol Pump Receipt',
        type: 'fuel',
        expectedData: {
          amount: 2000.00,
          merchant: 'Indian Oil',
          date: '2024-01-13',
          category: 'Transportation',
          paymentMethod: 'Cash'
        },
        difficulty: 'medium'
      },
      {
        id: 'amazon_invoice',
        name: 'Amazon Purchase Invoice',
        type: 'shopping',
        expectedData: {
          amount: 3299.99,
          merchant: 'Amazon India',
          date: '2024-01-12',
          category: 'Shopping',
          paymentMethod: 'Card',
          transactionId: 'AMZ987654321'
        },
        difficulty: 'hard'
      },
      {
        id: 'paytm_transfer',
        name: 'Paytm Money Transfer',
        type: 'payment_app',
        expectedData: {
          amount: 5000.00,
          merchant: 'John Doe',
          date: '2024-01-11',
          category: 'Transfer',
          paymentMethod: 'Paytm',
          transactionId: 'PTM456789123'
        },
        difficulty: 'easy'
      }
    ];
  }

  static async generateReceiptImage(receipt: SampleReceipt): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate receipt based on type
    switch (receipt.type) {
      case 'restaurant':
        this.generateRestaurantReceipt(ctx, receipt);
        break;
      case 'grocery':
        this.generateGroceryReceipt(ctx, receipt);
        break;
      case 'fuel':
        this.generateFuelReceipt(ctx, receipt);
        break;
      case 'shopping':
        this.generateShoppingReceipt(ctx, receipt);
        break;
      case 'payment_app':
        this.generatePaymentAppReceipt(ctx, receipt);
        break;
      default:
        this.generateGenericReceipt(ctx, receipt);
    }

    // Add noise based on difficulty
    if (receipt.difficulty !== 'easy') {
      this.addNoise(ctx, canvas, receipt.difficulty);
    }

    return canvas.toDataURL('image/png');
  }

  private static generateRestaurantReceipt(ctx: CanvasRenderingContext2D, receipt: SampleReceipt) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    let y = 50;
    
    // Header
    ctx.fillText(receipt.expectedData.merchant, 300, y);
    y += 40;
    
    ctx.font = '16px Arial';
    ctx.fillText('Food Delivery Receipt', 300, y);
    y += 60;
    
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    
    // Order details
    ctx.fillText('Order ID: ZOM123456789', 50, y);
    y += 30;
    ctx.fillText(`Date: ${receipt.expectedData.date}`, 50, y);
    y += 30;
    ctx.fillText('Time: 19:45', 50, y);
    y += 50;
    
    // Items
    ctx.fillText('Items Ordered:', 50, y);
    y += 30;
    ctx.fillText('1x Margherita Pizza (Large)     ₹350.00', 70, y);
    y += 25;
    ctx.fillText('1x Garlic Bread                 ₹80.00', 70, y);
    y += 25;
    ctx.fillText('Delivery Charges                ₹20.50', 70, y);
    y += 40;
    
    // Total
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Total Amount: ₹${receipt.expectedData.amount}`, 50, y);
    y += 40;
    
    // Payment
    ctx.font = '16px Arial';
    ctx.fillText(`Payment Method: ${receipt.expectedData.paymentMethod}`, 50, y);
    y += 30;
    ctx.fillText('Payment Status: Successful', 50, y);
    y += 50;
    
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for ordering with Zomato!', 300, y);
  }

  private static generateGroceryReceipt(ctx: CanvasRenderingContext2D, receipt: SampleReceipt) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    
    let y = 50;
    
    // Header
    ctx.fillText(receipt.expectedData.merchant, 300, y);
    y += 30;
    ctx.font = '14px Arial';
    ctx.fillText('Your Neighborhood Store', 300, y);
    y += 20;
    ctx.fillText('GST No: 27AABCU9603R1ZX', 300, y);
    y += 50;
    
    ctx.textAlign = 'left';
    ctx.font = '16px Arial';
    
    // Bill details
    ctx.fillText(`Date: ${receipt.expectedData.date}`, 50, y);
    y += 25;
    ctx.fillText('Time: 14:30:25', 50, y);
    y += 25;
    ctx.fillText('Bill No: BB001234', 50, y);
    y += 40;
    
    // Items
    ctx.fillText('Item                    Qty    Rate    Amount', 50, y);
    y += 25;
    ctx.fillText('Rice (5kg)               1     450.00   450.00', 50, y);
    y += 20;
    ctx.fillText('Dal Moong (1kg)          2     120.00   240.00', 50, y);
    y += 20;
    ctx.fillText('Cooking Oil (1L)         1     180.00   180.00', 50, y);
    y += 20;
    ctx.fillText('Onions (2kg)             1      60.00    60.00', 50, y);
    y += 20;
    ctx.fillText('Tomatoes (1kg)           1      40.00    40.00', 50, y);
    y += 20;
    ctx.fillText('Milk (1L)                2      55.00   110.00', 50, y);
    y += 20;
    ctx.fillText('Bread                    3      25.00    75.00', 50, y);
    y += 20;
    ctx.fillText('Eggs (30pcs)             1      95.75    95.75', 50, y);
    y += 40;
    
    // Totals
    ctx.fillText('Sub Total:                        1250.75', 50, y);
    y += 25;
    ctx.fillText('Discount:                            0.00', 50, y);
    y += 25;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Grand Total: ₹${receipt.expectedData.amount}`, 50, y);
    y += 40;
    
    ctx.font = '16px Arial';
    ctx.fillText(`Payment: ${receipt.expectedData.paymentMethod}`, 50, y);
    y += 30;
    
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for shopping with us!', 300, y);
  }

  private static generateFuelReceipt(ctx: CanvasRenderingContext2D, receipt: SampleReceipt) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    
    let y = 50;
    
    // Header
    ctx.fillText(receipt.expectedData.merchant, 300, y);
    y += 30;
    ctx.font = '16px Arial';
    ctx.fillText('Petrol Pump', 300, y);
    y += 20;
    ctx.fillText('Highway Road, Mumbai', 300, y);
    y += 50;
    
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    
    // Transaction details
    ctx.fillText(`Date: ${receipt.expectedData.date}`, 50, y);
    y += 30;
    ctx.fillText('Time: 16:45:30', 50, y);
    y += 30;
    ctx.fillText('Receipt No: IP001234567', 50, y);
    y += 30;
    ctx.fillText('Nozzle: 03', 50, y);
    y += 50;
    
    // Fuel details
    ctx.fillText('Product: Petrol', 50, y);
    y += 30;
    ctx.fillText('Rate per Litre: ₹100.00', 50, y);
    y += 30;
    ctx.fillText('Quantity: 20.00 Litres', 50, y);
    y += 50;
    
    // Amount
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`Total Amount: ₹${receipt.expectedData.amount}`, 50, y);
    y += 50;
    
    ctx.font = '16px Arial';
    ctx.fillText(`Payment Mode: ${receipt.expectedData.paymentMethod}`, 50, y);
    y += 40;
    
    ctx.textAlign = 'center';
    ctx.fillText('Drive Safe!', 300, y);
  }

  private static generateShoppingReceipt(ctx: CanvasRenderingContext2D, receipt: SampleReceipt) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    let y = 50;
    
    // Header
    ctx.fillText('amazon.in', 300, y);
    y += 40;
    ctx.font = '16px Arial';
    ctx.fillText('Tax Invoice/Bill of Supply/Cash Memo', 300, y);
    y += 50;
    
    ctx.textAlign = 'left';
    ctx.font = '16px Arial';
    
    // Order details
    ctx.fillText(`Order ID: ${receipt.expectedData.transactionId}`, 50, y);
    y += 25;
    ctx.fillText(`Order Date: ${receipt.expectedData.date}`, 50, y);
    y += 25;
    ctx.fillText('Invoice Date: 15-Jan-2024', 50, y);
    y += 40;
    
    // Billing address
    ctx.fillText('Bill To:', 50, y);
    y += 25;
    ctx.fillText('John Doe', 50, y);
    y += 20;
    ctx.fillText('123 Main Street', 50, y);
    y += 20;
    ctx.fillText('Mumbai, Maharashtra 400001', 50, y);
    y += 40;
    
    // Items
    ctx.fillText('Description                 Qty    Unit Price    Amount', 50, y);
    y += 25;
    ctx.fillText('Wireless Bluetooth          1      2999.99      2999.99', 50, y);
    y += 20;
    ctx.fillText('Headphones - Black', 50, y);
    y += 25;
    ctx.fillText('Shipping Charges             1       300.00       300.00', 50, y);
    y += 40;
    
    // Totals
    ctx.fillText('Subtotal:                                      2999.99', 50, y);
    y += 25;
    ctx.fillText('Shipping:                                       300.00', 50, y);
    y += 25;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Grand Total: ₹${receipt.expectedData.amount}`, 50, y);
    y += 40;
    
    ctx.font = '16px Arial';
    ctx.fillText(`Payment Method: ${receipt.expectedData.paymentMethod}`, 50, y);
  }

  private static generatePaymentAppReceipt(ctx: CanvasRenderingContext2D, receipt: SampleReceipt) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 800);
    
    // Paytm blue background header
    ctx.fillStyle = '#00BAF2';
    ctx.fillRect(0, 0, 600, 120);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    
    let y = 50;
    
    // Header
    ctx.fillText('Paytm', 300, y);
    y += 30;
    ctx.font = '16px Arial';
    ctx.fillText('Payment Successful', 300, y);
    y += 80;
    
    // Success icon area
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(300, y, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('✓', 300, y + 8);
    y += 80;
    
    ctx.fillStyle = 'black';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`₹${receipt.expectedData.amount}`, 300, y);
    y += 40;
    
    ctx.font = '18px Arial';
    ctx.fillText(`Sent to ${receipt.expectedData.merchant}`, 300, y);
    y += 60;
    
    ctx.textAlign = 'left';
    ctx.font = '16px Arial';
    
    // Transaction details
    ctx.fillText('Transaction Details:', 50, y);
    y += 40;
    
    ctx.fillText(`Transaction ID: ${receipt.expectedData.transactionId}`, 50, y);
    y += 30;
    ctx.fillText(`Date & Time: ${receipt.expectedData.date} 18:30`, 50, y);
    y += 30;
    ctx.fillText(`To: ${receipt.expectedData.merchant}`, 50, y);
    y += 30;
    ctx.fillText('From: Paytm Wallet', 50, y);
    y += 30;
    ctx.fillText('Status: Success', 50, y);
    y += 30;
    ctx.fillText('Message: Money transfer', 50, y);
    y += 50;
    
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillText('Paytm Payments Bank Ltd.', 300, y);
  }

  private static generateGenericReceipt(ctx: CanvasRenderingContext2D, receipt: SampleReceipt) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    
    let y = 50;
    
    ctx.fillText(receipt.expectedData.merchant, 300, y);
    y += 60;
    
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    
    ctx.fillText(`Date: ${receipt.expectedData.date}`, 50, y);
    y += 40;
    ctx.fillText(`Amount: ₹${receipt.expectedData.amount}`, 50, y);
    y += 40;
    ctx.fillText(`Category: ${receipt.expectedData.category}`, 50, y);
    
    if (receipt.expectedData.paymentMethod) {
      y += 40;
      ctx.fillText(`Payment: ${receipt.expectedData.paymentMethod}`, 50, y);
    }
  }

  private static addNoise(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, difficulty: 'medium' | 'hard') {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const noiseLevel = difficulty === 'hard' ? 25 : 15;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseLevel / 100) {
        const noise = Math.random() * 100 - 50;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  static async downloadSampleReceipt(receiptId: string): Promise<void> {
    const receipts = this.getSampleReceipts();
    const receipt = receipts.find(r => r.id === receiptId);
    
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    
    const imageDataUrl = await this.generateReceiptImage(receipt);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${receipt.name.replace(/\s+/g, '_')}.png`;
    link.href = imageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async createFileFromReceipt(receiptId: string): Promise<File> {
    const receipts = this.getSampleReceipts();
    const receipt = receipts.find(r => r.id === receiptId);
    
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    
    const imageDataUrl = await this.generateReceiptImage(receipt);
    
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    return new File([blob], `${receipt.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
  }
}