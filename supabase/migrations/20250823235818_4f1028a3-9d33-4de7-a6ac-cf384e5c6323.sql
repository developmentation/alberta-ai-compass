-- Update the modules RLS policy to allow public access to published content
DROP POLICY IF EXISTS "modules_select_published" ON public.modules;

-- Create new policy that allows public access to published modules
CREATE POLICY "modules_select_published_public"
ON public.modules
FOR SELECT
TO public
USING (
  status = 'published'::content_status 
  AND deleted_at IS NULL
);