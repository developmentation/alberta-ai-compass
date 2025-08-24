-- Fix infinite recursion in profiles RLS policies
-- The existing policies are trying to query profiles table from within profiles policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "admins_can_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;

-- Create new policies using the existing security definer function
CREATE POLICY "admins_can_update_profiles" 
ON public.profiles
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "admins_can_view_all_profiles" 
ON public.profiles
FOR SELECT 
USING (get_current_user_role() = 'admin');