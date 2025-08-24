-- Simplify API keys - remove encryption, just use admin access control
-- First drop the view that depends on the encrypted_api_key column
DROP VIEW IF EXISTS public.api_keys_admin CASCADE;

-- Drop the encryption functions since we're not using them
DROP FUNCTION IF EXISTS public.encrypt_api_key(text);
DROP FUNCTION IF EXISTS public.decrypt_api_key(text);

-- Update the api_keys table to store plain text keys (only admins can access anyway)
ALTER TABLE public.api_keys 
DROP COLUMN IF EXISTS encrypted_api_key,
ADD COLUMN IF NOT EXISTS api_key text;

-- Recreate the admin view to show actual API keys to admins
CREATE OR REPLACE VIEW public.api_keys_admin AS
SELECT 
  id,
  provider,
  api_key,
  model_names,
  description,
  is_active,
  added_by,
  updated_by,
  created_at,
  updated_at,
  deleted_at
FROM public.api_keys
WHERE EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::user_role
);

-- Grant access to the view for authenticated users (RLS will restrict to admins)
GRANT SELECT ON public.api_keys_admin TO authenticated;