-- Remove the unsafe policy that exposes profiles to unauthenticated users
DROP POLICY IF EXISTS "Allow unauthenticated to check password reset status" ON public.profiles;