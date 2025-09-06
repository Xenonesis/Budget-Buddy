version https://git-lfs.github.com/spec/v1
oid sha256:259ca9eab8f13bfa93cf0be36a73d8c7b64d51517a62a6b1608427b27f8eecd8
size 3313

-- Create a function to insert a transaction
CREATE OR REPLACE FUNCTION insert_transaction(
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
  INSERT INTO transactions (
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
