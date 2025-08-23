-- Fix security issues from linter

-- 1. Add missing RLS policies for media_assets
CREATE POLICY media_assets_select ON media_assets FOR SELECT USING (
    deleted_at IS NULL AND (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
        OR created_by = auth.uid()
    )
);
CREATE POLICY media_assets_crud_facilitator ON media_assets FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- 2. Fix security definer view by recreating without SECURITY DEFINER
DROP VIEW platform_statistics;
CREATE VIEW platform_statistics AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL) AS total_users,
    (SELECT COUNT(*) FROM learning_plans WHERE deleted_at IS NULL) AS total_plans,
    (SELECT COUNT(*) FROM news WHERE deleted_at IS NULL) AS total_news,
    (SELECT COUNT(*) FROM resources WHERE deleted_at IS NULL) AS total_resources,
    (SELECT COUNT(*) FROM tools WHERE deleted_at IS NULL) AS total_tools,
    (SELECT COUNT(*) FROM prompt_library WHERE deleted_at IS NULL) AS total_prompts;

-- 3. Fix function search path for update_timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Fix function search path for handle_new_user (already has it but make sure it's proper)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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