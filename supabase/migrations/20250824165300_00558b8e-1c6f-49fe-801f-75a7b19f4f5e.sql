-- Fix the security definer view issue
-- Recreate the view without security definer properties
DROP VIEW IF EXISTS public.api_keys_admin;

-- Create a simple view that relies on RLS policies instead of security definer
CREATE VIEW public.api_keys_admin AS
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
FROM public.api_keys;