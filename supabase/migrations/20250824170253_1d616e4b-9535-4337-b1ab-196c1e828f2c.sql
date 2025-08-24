-- Drop the recursive policy
DROP POLICY IF EXISTS "cohort_members_see_cohort_profiles" ON public.profiles;

-- Create a security definer function to get current user's email safely
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Create a non-recursive policy using the function
CREATE POLICY "cohort_members_see_cohort_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if users share a cohort (email-based enrollment)
  EXISTS (
    SELECT 1 
    FROM cohort_members cm1, cohort_members cm2
    WHERE cm1.email = get_current_user_email()
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