-- Drop the problematic policy completely
DROP POLICY IF EXISTS "cohort_members_basic_profiles" ON public.profiles;

-- Create a simple, non-recursive policy that allows basic profile access
-- This avoids any complex subqueries that could cause recursion
CREATE POLICY "profiles_basic_access" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow users to see their own profile
  id = auth.uid()
  OR
  -- Allow users in cohorts to see other cohort member profiles
  EXISTS (
    SELECT 1 FROM cohort_members cm1
    WHERE cm1.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cohort_members cm2 
      WHERE cm2.cohort_id = cm1.cohort_id 
      AND (cm2.user_id = profiles.id OR cm2.email = profiles.email)
    )
  )
  OR
  -- Allow email-based cohort members to see profiles
  EXISTS (
    SELECT 1 FROM cohort_members cm1
    WHERE cm1.email = (auth.jwt() ->> 'email')
    AND EXISTS (
      SELECT 1 FROM cohort_members cm2 
      WHERE cm2.cohort_id = cm1.cohort_id 
      AND (cm2.user_id = profiles.id OR cm2.email = profiles.email)
    )
  )
);