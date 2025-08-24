-- Fix the cohort discussions policies to avoid infinite recursion
DROP POLICY IF EXISTS "Users can view discussions of cohorts they are members of" ON public.cohort_discussions;
DROP POLICY IF EXISTS "Users can create discussions in cohorts they are members of" ON public.cohort_discussions;

-- Create safer policies that don't cause recursion
CREATE POLICY "Users can view discussions of their cohorts" 
ON public.cohort_discussions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM cohort_members cm 
    WHERE cm.cohort_id = cohort_discussions.cohort_id 
    AND cm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 
    FROM cohort_members cm 
    WHERE cm.cohort_id = cohort_discussions.cohort_id 
    AND cm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can create discussions in their cohorts" 
ON public.cohort_discussions 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND (
    EXISTS (
      SELECT 1 
      FROM cohort_members cm 
      WHERE cm.cohort_id = cohort_discussions.cohort_id 
      AND cm.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 
      FROM cohort_members cm 
      WHERE cm.cohort_id = cohort_discussions.cohort_id 
      AND cm.email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);