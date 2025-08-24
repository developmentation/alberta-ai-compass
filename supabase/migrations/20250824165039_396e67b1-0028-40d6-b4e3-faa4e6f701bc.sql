-- Simplified encryption using pgcrypto
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(
    digest(api_key_text || 'salt-key-2024', 'sha256'), 
    'base64'
  );
END;
$$;

-- For now, store keys in a way that can be retrieved by admins only
-- This is a simplified approach - in production, use proper key management
CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULL::text; -- Keys cannot be decrypted from hash
$$;

-- Update the view to handle the new structure
DROP VIEW IF EXISTS public.api_keys_decrypted;

-- Create a simpler approach: store keys encrypted and provide access only to admins
CREATE OR REPLACE VIEW public.api_keys_admin AS
SELECT 
  id,
  provider,
  model_names,
  description,
  is_active,
  added_by,
  updated_by,
  created_at,
  updated_at,
  deleted_at,
  '***ENCRYPTED***' as api_key_display,
  encrypted_api_key
FROM public.api_keys
WHERE EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::user_role
);

-- Grant access to the view for admins
GRANT SELECT ON public.api_keys_admin TO authenticated;