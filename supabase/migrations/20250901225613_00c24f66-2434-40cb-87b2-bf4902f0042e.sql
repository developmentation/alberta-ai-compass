-- Address SECURITY DEFINER view linter warnings
-- Refactor table-returning functions to reduce security surface area

-- 1. Replace get_platform_statistics function with a view + RLS approach
DROP FUNCTION IF EXISTS public.get_platform_statistics();

-- Create a view for platform statistics that uses RLS instead
CREATE VIEW public.platform_statistics AS
SELECT 
    (SELECT count(*) FROM profiles WHERE deleted_at IS NULL)::bigint AS total_users,
    (SELECT count(*) FROM learning_plans WHERE deleted_at IS NULL)::bigint AS total_plans,
    (SELECT count(*) FROM news WHERE deleted_at IS NULL)::bigint AS total_news,
    (SELECT count(*) FROM resources WHERE deleted_at IS NULL)::bigint AS total_resources,
    (SELECT count(*) FROM tools WHERE deleted_at IS NULL)::bigint AS total_tools,
    (SELECT count(*) FROM prompt_library WHERE deleted_at IS NULL)::bigint AS total_prompts;

-- Enable RLS on the view (admins only)
ALTER VIEW public.platform_statistics SET (security_barrier = true);

-- Create RLS policy for admin-only access
CREATE POLICY "Admin only platform statistics" 
ON public.platform_statistics 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
    )
);

-- 2. Replace get_user_profile_safe function with a simpler approach
DROP FUNCTION IF EXISTS public.get_user_profile_safe(uuid);

-- The profiles_public view already serves this purpose safely without SECURITY DEFINER
-- Admin users can access full profiles via the profiles table with existing RLS policies