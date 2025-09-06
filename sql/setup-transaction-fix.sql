-- Creates a function to insert transactions bypassing type conversions
-- Run this in your Supabase SQL editor to fix income transaction issues

-- Create a function to insert a transaction
CREATE OR REPLACE FUNCTION public.insert_transaction(
  p_user_id UUID,
  p_type TEXT,
  p_category_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT '',
  p_date DATE
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Insert the transaction using text type to bypass enum conversion
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
    gen_random_uuid(),
    p_user_id,
    p_type,
    p_category_id,
    p_amount,
    p_description,
    p_date,
    NOW(),
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 