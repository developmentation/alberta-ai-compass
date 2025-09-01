-- Fix SECURITY DEFINER view linter warnings with proper approach
-- Remove SECURITY DEFINER from table-returning functions

-- 1. Drop the failed view first
DROP VIEW IF EXISTS public.platform_statistics;

-- 2. Create a regular function without SECURITY DEFINER for platform statistics
-- This will rely on existing RLS policies on the underlying tables
CREATE OR REPLACE FUNCTION public.get_platform_statistics()
RETURNS TABLE(total_users bigint, total_plans bigint, total_news bigint, total_resources bigint, total_tools bigint, total_prompts bigint)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
    -- Check admin access using the existing secure function
    IF (SELECT get_current_user_role()) != 'admin' THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT count(*) FROM profiles WHERE deleted_at IS NULL)::bigint AS total_users,
        (SELECT count(*) FROM learning_plans WHERE deleted_at IS NULL)::bigint AS total_plans,
        (SELECT count(*) FROM news WHERE deleted_at IS NULL)::bigint AS total_news,
        (SELECT count(*) FROM resources WHERE deleted_at IS NULL)::bigint AS total_resources,
        (SELECT count(*) FROM tools WHERE deleted_at IS NULL)::bigint AS total_tools,
        (SELECT count(*) FROM prompt_library WHERE deleted_at IS NULL)::bigint AS total_prompts;
END;
$$;

-- 3. Create a replacement for get_user_profile_safe without SECURITY DEFINER
-- Use the existing profiles_public view and let admins access profiles table directly
-- No replacement needed - admins can query profiles table with existing RLS policies