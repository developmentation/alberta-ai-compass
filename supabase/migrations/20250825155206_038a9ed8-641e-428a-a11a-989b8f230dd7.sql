-- Add policy to allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin');