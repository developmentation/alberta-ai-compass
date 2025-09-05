-- Drop the existing policy that checks enrollments (which is unused)
DROP POLICY IF EXISTS "cohorts_select_enrolled" ON public.cohorts;

-- Create new policy that checks cohort_members instead of enrollments
CREATE POLICY "cohorts_select_enrolled" ON public.cohorts
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM cohort_members cm
    WHERE (
      cm.cohort_id = cohorts.id 
      AND (
        cm.user_id = auth.uid() 
        OR cm.email = (
          SELECT profiles.email
          FROM profiles
          WHERE profiles.id = auth.uid()
        )
      )
    )
  )) 
  OR (EXISTS (
    SELECT 1
    FROM profiles
    WHERE (
      profiles.id = auth.uid() 
      AND profiles.role = ANY (ARRAY['facilitator'::user_role, 'admin'::user_role])
    )
  ))
);