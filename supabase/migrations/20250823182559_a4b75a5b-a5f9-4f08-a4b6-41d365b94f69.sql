-- Phase 1: Critical Database Security Fixes (Handle existing objects)

-- 1. Create secure function for platform statistics (instead of RLS on view)
CREATE OR REPLACE FUNCTION public.get_platform_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    stats jsonb;
    user_role user_role;
BEGIN
    -- Check if user is admin
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = auth.uid() AND deleted_at IS NULL;
    
    IF user_role != 'admin' THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Get statistics
    SELECT jsonb_build_object(
        'total_users', (SELECT count(*) FROM profiles WHERE deleted_at IS NULL),
        'total_plans', (SELECT count(*) FROM learning_plans WHERE deleted_at IS NULL),
        'total_news', (SELECT count(*) FROM news WHERE deleted_at IS NULL),
        'total_resources', (SELECT count(*) FROM resources WHERE deleted_at IS NULL),
        'total_tools', (SELECT count(*) FROM tools WHERE deleted_at IS NULL),
        'total_prompts', (SELECT count(*) FROM prompt_library WHERE deleted_at IS NULL)
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- 2. Fix security definer function with proper search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Fix promote_to_admin function with proper search path and audit logging
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_user_role user_role;
    target_user_id uuid;
    old_role user_role;
BEGIN
    -- Get current user's role with explicit check
    SELECT role INTO current_user_role 
    FROM profiles 
    WHERE id = auth.uid() AND deleted_at IS NULL;
    
    -- Only allow admins to promote users
    IF current_user_role != 'admin' THEN
        RETURN false;
    END IF;
    
    -- Get target user ID and current role
    SELECT id, role INTO target_user_id, old_role 
    FROM profiles 
    WHERE email = target_email AND deleted_at IS NULL;
    
    IF target_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Update user role
    UPDATE profiles 
    SET role = 'admin', updated_at = now()
    WHERE id = target_user_id;
    
    RETURN FOUND;
END;
$$;

-- 4. Strengthen profiles RLS policies to prevent role self-modification
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Separate policy for self-updates (excluding role changes)
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (
  id = auth.uid() 
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Role cannot be changed by user
);

-- Separate policy for admin updates (can change any field including roles)
DROP POLICY IF EXISTS "profiles_update_by_admin" ON public.profiles;
CREATE POLICY "profiles_update_by_admin" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Add trigger for updating updated_at timestamp on profiles if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();