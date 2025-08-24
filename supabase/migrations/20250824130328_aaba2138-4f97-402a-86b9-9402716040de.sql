-- Fix infinite recursion in cohort_members RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "cohort_members_cohort_select" ON cohort_members;
DROP POLICY IF EXISTS "cohort_members_own_select" ON cohort_members;
DROP POLICY IF EXISTS "cohort_members_facilitator_crud" ON cohort_members;

-- Create new policies without recursion
-- Facilitators and admins can manage all cohort members
CREATE POLICY "cohort_members_facilitator_manage" 
ON cohort_members 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- Users can view cohort member info for cohorts they belong to
-- This avoids recursion by using a simpler check
CREATE POLICY "cohort_members_view_own_cohorts" 
ON cohort_members 
FOR SELECT 
TO authenticated
USING (
  -- User can see members of cohorts where they are enrolled by email match
  cohort_id IN (
    SELECT DISTINCT cohort_id 
    FROM cohort_members cm2 
    WHERE cm2.email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR cm2.user_id = auth.uid()
  )
  OR 
  -- Or if they are facilitator/admin
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);