-- Update the modules RLS policy to allow admins and facilitators to update any module
DROP POLICY IF EXISTS "modules_crud_facilitator" ON public.modules;

-- Create separate policies for better control
CREATE POLICY "modules_select_facilitator" 
ON public.modules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
);

CREATE POLICY "modules_insert_facilitator" 
ON public.modules 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
);

CREATE POLICY "modules_update_facilitator" 
ON public.modules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
)
WITH CHECK (
  -- Allow admins and facilitators to update any module
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
);

CREATE POLICY "modules_delete_facilitator" 
ON public.modules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
);