-- Add timezone column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
        RAISE NOTICE 'Added timezone column to profiles table';
    END IF;
END $$;

-- Create a reliable function for inserting transactions
CREATE OR REPLACE FUNCTION public.insert_transaction_reliable(
  p_user_id UUID,
  p_type TEXT,
  p_category_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT '',
  p_date DATE
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID := gen_random_uuid();
BEGIN
  -- Insert the transaction directly with explicit typing
  INSERT INTO public.transactions (
    id,
    user_id,
    type,
    category_id,
    amount,
    description,
    date,
    created_at,
    updated_at
  ) VALUES (
    v_transaction_id,
    p_user_id,
    p_type::text, -- Force text conversion
    p_category_id,
    p_amount,
    p_description,
    p_date,
    NOW(),
    NOW()
  );
  
  RETURN v_transaction_id;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in insert_transaction_reliable: %', SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;