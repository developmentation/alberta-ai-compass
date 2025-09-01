-- Fix SECURITY DEFINER view issue
-- Drop and recreate views without SECURITY DEFINER properties

-- 1. Recreate api_keys_admin view (ensure no SECURITY DEFINER)
DROP VIEW IF EXISTS public.api_keys_admin;
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

-- 2. Recreate profiles_public view (ensure no SECURITY DEFINER)  
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  full_name,
  role,
  organization,
  department,
  is_active,
  created_at,
  updated_at
FROM public.profiles
WHERE deleted_at IS NULL;