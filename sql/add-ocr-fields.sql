-- Add OCR-related fields to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS ocr_extracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS original_file_name TEXT,
ADD COLUMN IF NOT EXISTS ocr_raw_text TEXT;

-- Add comment for the new fields
COMMENT ON COLUMN transactions.ocr_extracted IS 'Whether this transaction was created from OCR extraction';
COMMENT ON COLUMN transactions.ocr_confidence IS 'Confidence percentage of OCR extraction (0-100)';
COMMENT ON COLUMN transactions.original_file_name IS 'Original filename of uploaded invoice/receipt';
COMMENT ON COLUMN transactions.ocr_raw_text IS 'Raw text extracted from OCR for debugging purposes';

-- Create index for OCR transactions
CREATE INDEX IF NOT EXISTS transactions_ocr_extracted_idx ON transactions(ocr_extracted);