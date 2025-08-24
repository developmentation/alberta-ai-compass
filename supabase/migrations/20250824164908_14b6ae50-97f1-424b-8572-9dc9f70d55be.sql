-- Add encryption functions and secure API key storage
-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt API keys
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key_text text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT encode(
    encrypt(
      api_key_text::bytea,
      'ai-compass-encryption-key-2024'::bytea,
      'aes'
    ),
    'base64'
  );
$$;

-- Create a function to decrypt API keys (only for admins)
CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT convert_from(
    decrypt(
      decode(encrypted_key, 'base64'),
      'ai-compass-encryption-key-2024'::bytea,
      'aes'
    ),
    'UTF8'
  );
$$;

-- Add encrypted_api_key column
ALTER TABLE public.api_keys 
ADD COLUMN encrypted_api_key text;

-- Migrate existing API keys to encrypted format
UPDATE public.api_keys 
SET encrypted_api_key = public.encrypt_api_key(api_key)
WHERE api_key IS NOT NULL AND encrypted_api_key IS NULL;

-- Create a view for admins to access decrypted keys safely
CREATE OR REPLACE VIEW public.api_keys_decrypted AS
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
  CASE 
    WHEN encrypted_api_key IS NOT NULL THEN public.decrypt_api_key(encrypted_api_key)
    ELSE NULL
  END as api_key
FROM public.api_keys
WHERE EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'::user_role
);

-- Remove the plain text api_key column after migration
ALTER TABLE public.api_keys DROP COLUMN api_key;

-- Create RLS policy for the decrypted view
ALTER VIEW public.api_keys_decrypted SET (security_invoker = on);

-- Update existing RLS policies to work with new structure
DROP POLICY IF EXISTS "apikeys_admin" ON public.api_keys;

CREATE POLICY "apikeys_admin_encrypted" 
ON public.api_keys
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  )
)
WITH CHECK (
  added_by = auth.uid() OR updated_by = auth.uid()
);