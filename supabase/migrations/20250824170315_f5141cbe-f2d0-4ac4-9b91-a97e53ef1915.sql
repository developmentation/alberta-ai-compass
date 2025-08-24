-- Drop all the problematic policies and functions
DROP POLICY IF EXISTS "cohort_members_see_cohort_profiles" ON public.profiles;
DROP FUNCTION IF EXISTS public.get_current_user_email();

-- Create a much simpler approach: allow cohort members to see basic profile info
-- without complex recursion-prone queries
CREATE POLICY "cohort_members_basic_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if there's any cohort membership connection (simplified check)
  id IN (
    SELECT DISTINCT cm.user_id 
    FROM cohort_members cm 
    WHERE cm.user_id IS NOT NULL
    AND cm.cohort_id IN (
      SELECT cm2.cohort_id 
      FROM cohort_members cm2 
      WHERE cm2.user_id = auth.uid() OR cm2.email = (
        SELECT u.email FROM auth.users u WHERE u.id = auth.uid()
      )
    )
  )
  OR
  email IN (
    SELECT DISTINCT cm.email 
    FROM cohort_members cm 
    WHERE cm.email IS NOT NULL
    AND cm.cohort_id IN (
      SELECT cm2.cohort_id 
      FROM cohort_members cm2 
      WHERE cm2.user_id = auth.uid() OR cm2.email = (
        SELECT u.email FROM auth.users u WHERE u.id = auth.uid()
      )
    )
  )
);