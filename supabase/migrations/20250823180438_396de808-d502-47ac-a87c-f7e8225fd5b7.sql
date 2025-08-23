-- Fix remaining security issues

-- Fix promote_to_admin function search path
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN false;
    END IF;
    
    -- Update user role
    UPDATE profiles 
    SET role = 'admin', updated_at = now()
    WHERE email = target_email AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$;

-- Add RLS policy for platform_statistics view access (admin only)
CREATE POLICY platform_statistics_admin ON platform_statistics FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enable RLS on platform_statistics if it's a materialized view equivalent
-- Note: Regular views don't need RLS but if converted to table later, this would be needed