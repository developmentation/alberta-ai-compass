-- Fix the security definer view issue by recreating the view without security definer
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