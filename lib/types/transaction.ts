export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
  // OCR-related fields
  ocr_extracted?: boolean;
  ocr_confidence?: number;
  original_file_name?: string;
  ocr_raw_text?: string;
}

export interface CreateTransactionData {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  // OCR-related fields
  ocr_extracted?: boolean;
  ocr_confidence?: number;
  original_file_name?: string;
  ocr_raw_text?: string;
}

export interface OCRTransactionData {
  amount?: number;
  description?: string;
  date?: string;
  merchant?: string;
  category?: string;
  type?: 'income' | 'expense';
  confidence?: number;
}