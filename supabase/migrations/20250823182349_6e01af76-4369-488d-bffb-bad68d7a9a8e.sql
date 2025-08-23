-- Phase 1: Critical Database Security Fixes (Corrected)

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

-- 3. Update handle_new_user function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Determine role based on email domain
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM allowed_domains ad 
            WHERE ad.deleted_at IS NULL 
            AND NEW.email LIKE '%@' || ad.domain
        ) THEN 'government'::user_role
        ELSE 'public'::user_role
    END INTO user_role;

    -- Insert profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        user_role
    );
    
    RETURN NEW;
END;
$$;

-- 4. Create audit logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    performed_by uuid REFERENCES auth.users(id),
    performed_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Fix promote_to_admin function with proper search path and audit logging
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
    
    -- Log the role change for audit purposes
    INSERT INTO public.audit_logs (
        action, 
        table_name, 
        record_id, 
        old_values, 
        new_values, 
        performed_by
    ) VALUES (
        'role_change',
        'profiles',
        target_user_id,
        jsonb_build_object('role', old_role::text),
        jsonb_build_object('role', 'admin'),
        auth.uid()
    );
    
    RETURN FOUND;
END;
$$;

-- 6. Strengthen profiles RLS policies to prevent role self-modification
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Separate policy for self-updates (excluding role changes)
CREATE POLICY "profiles_update_self" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (
  id = auth.uid() 
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Role cannot be changed by user
);

-- Separate policy for admin updates (can change any field including roles)
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

-- 7. Add trigger for updating updated_at timestamp on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();