-- Add temporary password columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN temporary_password_hash TEXT,
ADD COLUMN requires_password_reset BOOLEAN DEFAULT false,
ADD COLUMN temp_password_expires_at TIMESTAMPTZ;

-- RLS Policy: Only admins can set temporary passwords
CREATE POLICY "Admins can manage temporary passwords"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);

-- RLS Policy: Users can read their own password reset status
CREATE POLICY "Users can read own password reset status"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);