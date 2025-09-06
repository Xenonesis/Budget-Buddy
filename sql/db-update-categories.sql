-- Add type field to categories table if it doesn't exist
DO $$
BEGIN
    -- Check if type column exists in categories table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
    ) THEN
        -- Add type column with default value 'expense'
        ALTER TABLE categories ADD COLUMN type TEXT CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'expense';
        
        -- Set existing categories with known income-related names to 'income' type
        UPDATE categories 
        SET type = 'income' 
        WHERE name ILIKE ANY(ARRAY['salary', 'income', 'freelance', 'investments', 'gifts', 'refunds']);
        
        -- Set some categories to 'both' if they could be either
        UPDATE categories 
        SET type = 'both' 
        WHERE name ILIKE ANY(ARRAY['transfer', 'other']);
        
        RAISE NOTICE 'Added type column to categories table';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'is_active'
    ) THEN
        -- Add is_active column with default value true
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to categories table';
    END IF;
END $$; 