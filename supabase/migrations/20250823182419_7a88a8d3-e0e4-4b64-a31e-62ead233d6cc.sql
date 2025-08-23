-- Phase 2: Fix Security Issues

-- 1. Since platform_statistics is a view that aggregates data,
-- we need to recreate it with proper security controls
-- First drop the existing view
DROP VIEW IF EXISTS public.platform_statistics;

-- 2. Create a secure function to get platform statistics (admin only)
CREATE OR REPLACE FUNCTION public.get_platform_statistics()
RETURNS TABLE(
    total_users bigint,
    total_plans bigint,
    total_news bigint,
    total_resources bigint,
    total_tools bigint,
    total_prompts bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow admins to access platform statistics
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
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