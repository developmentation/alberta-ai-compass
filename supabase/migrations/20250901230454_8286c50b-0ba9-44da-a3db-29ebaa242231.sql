-- Fix infinite recursion in profiles table RLS policies
-- The issue is that policies are referencing the profiles table from within profiles table policies

-- First, drop all existing problematic policies on profiles table
DROP POLICY IF EXISTS "Admins and facilitators can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- The get_current_user_role function already exists and is safe, so we'll use it

-- Create new safe policies using the security definer function
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins and facilitators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'facilitator'));