// Real-world OCR patterns for Indian payment systems and receipts

interface MerchantCategoryData {
  category: string;
  type: 'income' | 'expense';
  keywords: string[];
}

export const INDIAN_PAYMENT_PATTERNS = {
  // Paytm patterns
  paytm: {
    amount: [
      /paytm.*?(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi,
      /(?:paid|amount|total).*?(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi,
      /₹\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)\s*(?:paid|sent|transferred)/gi
    ],
    merchant: [
      /(?:paid to|sent to|merchant)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$|[0-9])/gi,
      /to\s+([a-zA-Z\s&.-]+?)(?:\s+for|\s+on|\n|$)/gi
    ],
    transactionId: [
      /(?:transaction id|txn id|order id)\s*:?\s*([a-zA-Z0-9]+)/gi,
      /id\s*:?\s*([a-zA-Z0-9]{8,})/gi
    ],
    date: [
      /(?:on|date)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
      /(\d{1,2}\s+\w+\s+\d{4})/gi
    ]
  },

  // Razorpay patterns
  razorpay: {
    amount: [
      /razorpay.*?(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi,
      /(?:amount|total|paid)\s*:?\s*(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi
    ],
    merchant: [
      /(?:payment to|merchant|business)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$|[0-9])/gi
    ],
    transactionId: [
      /(?:payment id|transaction id|order id)\s*:?\s*([a-zA-Z0-9_-]+)/gi
    ]
  },

  // UPI patterns
  upi: {
    amount: [
      /upi.*?(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi,
      /(?:sent|paid|transferred)\s*(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi
    ],
    merchant: [
      /(?:to|sent to)\s+([a-zA-Z\s&.-]+?)(?:\s+via|\s+using|\n|$)/gi,
      /(?:recipient|payee)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$)/gi
    ],
    transactionId: [
      /(?:utr|rrn|ref no|transaction ref)\s*:?\s*([a-zA-Z0-9]+)/gi
    ]
  },

  // General Indian receipt patterns
  general: {
    amount: [
      // Standard currency patterns
      /(?:total|amount|bill|grand total|net amount|final amount)\s*:?\s*(?:rs\.?|₹|inr)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
      /(?:rs\.?|₹)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:only|\/-|total)?/gi,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rs\.?|₹|inr)/gi,
      
      // Amount without currency symbol but with context
      /(?:total|amount|bill|grand total|net amount|final amount|paid|due)\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
      
      // Standalone amounts (common patterns)
      /(?:^|\s)(\d{1,7}(?:\.\d{2})?)(?:\s*only|\s*\/-|\s*$)/gm,
      
      // Amount with decimal variations
      /(?:rs\.?|₹)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/gi,
      /(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rs\.?|₹)/gi,
      
      // Amount in parentheses or brackets
      /[\(\[](?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rs\.?|₹)?[\)\]]/gi,
      
      // Amount with words
      /(?:rupees?|rs\.?|₹)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
      
      // Simple number patterns (last resort)
      /(?:^|\s)(\d{2,6}(?:\.\d{2})?)(?=\s|$)/gm
    ],
    date: [
      /(?:date|bill date|invoice date)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/g,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4})/gi
    ],
    merchant: [
      /(?:bill from|invoice from|merchant|store|shop)\s*:?\s*([a-zA-Z\s&.-]+?)(?:\n|$|[0-9])/gi,
      /([a-zA-Z\s&.-]+?)(?:\s+pvt\.?\s+ltd\.?|\s+limited|\s+inc\.?)/gi
    ]
  }
};

export const MERCHANT_CATEGORIES: Record<string, MerchantCategoryData> = {
  'zomato': { category: 'Food & Dining', type: 'expense', keywords: ['food', 'restaurant', 'delivery'] },
  'swiggy': { category: 'Food & Dining', type: 'expense', keywords: ['food', 'restaurant', 'delivery'] },
  'uber': { category: 'Transportation', type: 'expense', keywords: ['taxi', 'ride', 'transport'] },
  'ola': { category: 'Transportation', type: 'expense', keywords: ['taxi', 'ride', 'transport'] },
  'amazon': { category: 'Shopping', type: 'expense', keywords: ['shopping', 'ecommerce', 'online'] },
  'flipkart': { category: 'Shopping', type: 'expense', keywords: ['shopping', 'ecommerce', 'online'] },
  'myntra': { category: 'Shopping', type: 'expense', keywords: ['fashion', 'clothing', 'shopping'] },
  'bigbasket': { category: 'Groceries', type: 'expense', keywords: ['grocery', 'food', 'vegetables'] },
  'grofers': { category: 'Groceries', type: 'expense', keywords: ['grocery', 'food', 'vegetables'] },
  'bookmyshow': { category: 'Entertainment', type: 'expense', keywords: ['movie', 'entertainment', 'tickets'] },
  'netflix': { category: 'Entertainment', type: 'expense', keywords: ['streaming', 'entertainment', 'subscription'] },
  'spotify': { category: 'Entertainment', type: 'expense', keywords: ['music', 'streaming', 'subscription'] },
  'airtel': { category: 'Utilities', type: 'expense', keywords: ['mobile', 'telecom', 'recharge'] },
  'jio': { category: 'Utilities', type: 'expense', keywords: ['mobile', 'telecom', 'recharge'] },
  'vodafone': { category: 'Utilities', type: 'expense', keywords: ['mobile', 'telecom', 'recharge'] },
  'bsnl': { category: 'Utilities', type: 'expense', keywords: ['mobile', 'telecom', 'recharge'] },
  'irctc': { category: 'Transportation', type: 'expense', keywords: ['train', 'railway', 'travel'] },
  'makemytrip': { category: 'Transportation', type: 'expense', keywords: ['travel', 'flight', 'hotel'] },
  'goibibo': { category: 'Transportation', type: 'expense', keywords: ['travel', 'flight', 'hotel'] },
  'apollo': { category: 'Healthcare', type: 'expense', keywords: ['pharmacy', 'medicine', 'health'] },
  'medplus': { category: 'Healthcare', type: 'expense', keywords: ['pharmacy', 'medicine', 'health'] },
  'pharmeasy': { category: 'Healthcare', type: 'expense', keywords: ['pharmacy', 'medicine', 'health'] }
};

export const AMOUNT_VALIDATION_RULES = {
  minAmount: 0.01,
  maxAmount: 10000000, // 1 crore
  decimalPlaces: 2,
  commonAmounts: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000], // Common Indian denominations
  suspiciousPatterns: [
    /^0+$/, // All zeros
    /^1{4,}$/, // Repeating 1s
    /^9{4,}$/, // Repeating 9s
  ]
};

export const DATE_VALIDATION_RULES = {
  minDate: new Date('2020-01-01'), // Reasonable minimum date
  maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
  formats: [
    'DD/MM/YYYY',
    'DD-MM-YYYY',
    'DD MMM YYYY',
    'YYYY-MM-DD',
    'MM/DD/YYYY'
  ]
};

export const TRANSACTION_ID_PATTERNS = [
  /^[A-Z0-9]{8,20}$/, // Standard alphanumeric
  /^TXN[A-Z0-9]{6,15}$/, // Transaction prefix
  /^UPI[A-Z0-9]{6,15}$/, // UPI prefix
  /^PAY[A-Z0-9]{6,15}$/, // Payment prefix
  /^ORD[A-Z0-9]{6,15}$/, // Order prefix
  /^[0-9]{10,16}$/, // Numeric only
  /^[A-Z]{2,4}[0-9]{6,12}$/ // Letters followed by numbers
];

export function detectPaymentPlatform(text: string): string | null {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('paytm')) return 'paytm';
  if (textLower.includes('razorpay')) return 'razorpay';
  if (textLower.includes('upi') || textLower.includes('unified payments')) return 'upi';
  if (textLower.includes('phonepe')) return 'phonepe';
  if (textLower.includes('googlepay') || textLower.includes('google pay')) return 'googlepay';
  if (textLower.includes('amazon pay')) return 'amazonpay';
  if (textLower.includes('mobikwik')) return 'mobikwik';
  if (textLower.includes('freecharge')) return 'freecharge';
  
  return null;
}

export function getMerchantCategory(merchantName: string): { category: string; type: 'income' | 'expense' } | null {
  const merchantLower = merchantName.toLowerCase();
  
  for (const [key, data] of Object.entries(MERCHANT_CATEGORIES)) {
    if (merchantLower.includes(key) || data.keywords.some(keyword => merchantLower.includes(keyword))) {
      return { category: data.category, type: data.type };
    }
  }
  
  return null;
}