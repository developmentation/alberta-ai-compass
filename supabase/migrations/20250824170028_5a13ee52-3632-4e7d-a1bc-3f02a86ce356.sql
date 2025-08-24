-- Add RLS policy to allow cohort members to view each other's basic profile info
CREATE POLICY "cohort_members_can_view_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM cohort_members cm1, cohort_members cm2
    WHERE cm1.user_id = auth.uid() 
    AND cm2.user_id = profiles.id
    AND cm1.cohort_id = cm2.cohort_id
  ) OR
  EXISTS (
    SELECT 1 FROM cohort_members cm1, cohort_members cm2
    WHERE (cm1.email = (SELECT email FROM profiles WHERE id = auth.uid()) OR cm1.user_id = auth.uid())
    AND (cm2.email = profiles.email OR cm2.user_id = profiles.id)
    AND cm1.cohort_id = cm2.cohort_id
  )
);