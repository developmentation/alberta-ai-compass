-- Drop the problematic policy
DROP POLICY IF EXISTS "cohort_members_can_view_profiles" ON public.profiles;

-- Create a simpler, more reliable policy for cohort members to view each other
CREATE POLICY "cohort_members_see_cohort_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if users share a cohort (email-based enrollment)
  EXISTS (
    SELECT 1 
    FROM cohort_members cm1, cohort_members cm2
    WHERE cm1.email = (SELECT email FROM profiles WHERE id = auth.uid())
    AND cm2.email = profiles.email
    AND cm1.cohort_id = cm2.cohort_id
  )
  OR 
  -- Allow if users share a cohort (user_id-based enrollment)
  EXISTS (
    SELECT 1 
    FROM cohort_members cm1, cohort_members cm2
    WHERE cm1.user_id = auth.uid()
    AND cm2.user_id = profiles.id
    AND cm1.cohort_id = cm2.cohort_id
  )
);