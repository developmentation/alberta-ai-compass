-- Fix enrollments table and update RLS policies

-- Add cohort_id to enrollments table
ALTER TABLE public.enrollments ADD COLUMN cohort_id uuid REFERENCES public.cohorts(id);

-- Update RLS policies to allow public read access to published content

-- News: Allow public to read active/published news
DROP POLICY IF EXISTS "news_select_active" ON public.news;
CREATE POLICY "news_select_published" 
ON public.news 
FOR SELECT 
USING (
  status = 'published' 
  AND is_active = true 
  AND deleted_at IS NULL
);

-- Tools: Allow public to read published tools
DROP POLICY IF EXISTS "tools_select_active" ON public.tools;
CREATE POLICY "tools_select_published" 
ON public.tools 
FOR SELECT 
USING (
  status = 'published' 
  AND deleted_at IS NULL
);

-- Prompt Library: Allow public to read published prompts
DROP POLICY IF EXISTS "prompts_select_active" ON public.prompt_library;
CREATE POLICY "prompts_select_published" 
ON public.prompt_library 
FOR SELECT 
USING (
  status = 'published' 
  AND deleted_at IS NULL
);

-- Resources: Allow public to read published resources
DROP POLICY IF EXISTS "resources_select_active" ON public.resources;
CREATE POLICY "resources_select_published" 
ON public.resources 
FOR SELECT 
USING (
  status = 'published' 
  AND is_active = true 
  AND deleted_at IS NULL
);

-- Learning Plans: Allow authenticated users to read published plans
DROP POLICY IF EXISTS "plans_select_all" ON public.learning_plans;
CREATE POLICY "plans_select_published_auth" 
ON public.learning_plans 
FOR SELECT 
TO authenticated
USING (
  status = 'published' 
  AND deleted_at IS NULL
);

-- Cohorts: Only allow users to see cohorts they are enrolled in
CREATE POLICY "cohorts_select_enrolled" 
ON public.cohorts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.user_id = auth.uid() 
    AND enrollments.cohort_id = cohorts.id
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
);