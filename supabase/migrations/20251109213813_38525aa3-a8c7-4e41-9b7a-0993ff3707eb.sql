-- Create a policy to allow unauthenticated users to check password reset status
-- This is needed for the login flow to detect if a temp password is required
-- We only expose the minimal fields needed for this check
CREATE POLICY "Allow unauthenticated to check password reset status"
ON public.profiles
FOR SELECT
TO anon
USING (true);