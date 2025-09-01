-- Drop the existing broad policy that allows all authenticated users to see all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create more granular policies for email address protection

-- 1. Users can see their own complete profile (including email)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Admins and facilitators can see all profiles (including emails)
CREATE POLICY "Admins and facilitators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() 
  AND p.role IN ('admin'::user_role, 'facilitator'::user_role)
  AND p.deleted_at IS NULL
));

-- 3. Create a view for limited profile access (without email) for regular users
CREATE OR REPLACE VIEW public.profiles_public AS
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