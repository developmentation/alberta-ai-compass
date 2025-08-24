-- Fix security warnings: Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key_text text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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