-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read own password reset status" ON public.profiles;

-- Drop the other problematic policy too
DROP POLICY IF EXISTS "Admins can manage temporary passwords" ON public.profiles;