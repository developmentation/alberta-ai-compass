-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_by_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- Create restrictive policies that use AND logic for better security
-- Users can only view their own profile data
CREATE POLICY "users_can_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "users_can_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id 
  AND (
    role != 'government'::user_role 
    OR EXISTS (
      SELECT 1 FROM allowed_domains ad 
      WHERE ad.deleted_at IS NULL 
      AND email ~~ ('%@' || ad.domain)
    )
  )
);

-- Users can only update their own profile (but cannot change role)
CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (
    SELECT role FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Separate admin policy for viewing profiles (more restrictive)
CREATE POLICY "admins_can_view_all_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
    AND deleted_at IS NULL
  )
);

-- Separate admin policy for updating profiles
CREATE POLICY "admins_can_update_profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'::user_role
    AND admin_profile.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'::user_role
    AND admin_profile.deleted_at IS NULL
  )
);

-- Explicit denial policy to prevent any unauthorized access
CREATE POLICY "deny_unauthorized_profile_access"
ON public.profiles
FOR ALL
TO public
USING (false);

-- Create a security definer function for safe profile queries that admins might need
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  role user_role,
  department text,
  organization text,
  created_at timestamptz,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
    AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return profile data WITHOUT email address for security
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.role,
    p.department,
    p.organization,
    p.created_at,
    p.is_active
  FROM profiles p
  WHERE p.id = target_user_id
  AND p.deleted_at IS NULL;
END;
$$;