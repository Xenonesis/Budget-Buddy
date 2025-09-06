-- Update categories table to ensure it has type column for income/expense categories
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
        ALTER TABLE categories ADD COLUMN type TEXT DEFAULT 'expense';
        
        -- Add check constraint to limit values
        ALTER TABLE categories ADD CONSTRAINT categories_type_check 
            CHECK (type IN ('income', 'expense', 'both'));
        
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
    
    -- Check if is_active column exists
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