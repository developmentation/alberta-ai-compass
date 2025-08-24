-- Update the learning plans RLS policy to allow public access to published content
DROP POLICY IF EXISTS "plans_select_published_auth" ON public.learning_plans;

-- Create new policy that allows public access to published learning plans
CREATE POLICY "plans_select_published_public"
ON public.learning_plans
FOR SELECT
TO public
USING (
  status = 'published'::content_status 
  AND deleted_at IS NULL
);