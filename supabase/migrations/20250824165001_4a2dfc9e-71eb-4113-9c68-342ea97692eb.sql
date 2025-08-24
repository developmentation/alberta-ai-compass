-- Fix security warnings: Update functions with correct pgcrypto syntax
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key_text text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT encode(
    encrypt_iv(
      api_key_text::bytea,
      'ai-compass-encryption-key-2024-32chars!'::bytea,
      gen_random_bytes(16),
      'aes-cbc'
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
    decrypt_iv(
      decode(encrypted_key, 'base64'),
      'ai-compass-encryption-key-2024-32chars!'::bytea,
      substring(decode(encrypted_key, 'base64') from 1 for 16),
      'aes-cbc'
    ),
    'UTF8'
  );
$$;