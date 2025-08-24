-- Fix the remaining recursion issue in cohort_members policies
DROP POLICY IF EXISTS "cohort_members_view_own_cohorts" ON cohort_members;

-- Simpler policy: Users can view cohort member info if they are facilitators/admins
-- Or if they are querying their own membership record
CREATE POLICY "cohort_members_view_access" 
ON cohort_members 
FOR SELECT 
TO authenticated
USING (
  -- Facilitators and admins can see all
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
  OR
  -- Users can see their own membership records (by user_id or email match)
  (
    user_id = auth.uid() 
    OR 
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);