-- Allow facilitators and admins to delete any record, not just their own
-- Update DELETE policies to remove created_by restrictions

-- Update existing DELETE policies to remove ownership restrictions

-- NEWS: Update delete policy
DROP POLICY IF EXISTS "news_delete_facilitator" ON public.news;
CREATE POLICY "news_delete_facilitator" ON public.news
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- LEARNING PLANS: Update delete policy  
DROP POLICY IF EXISTS "plans_delete_facilitator" ON public.learning_plans;
CREATE POLICY "plans_delete_facilitator" ON public.learning_plans
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- COHORTS: Update delete policy
DROP POLICY IF EXISTS "cohorts_delete_facilitator" ON public.cohorts;
CREATE POLICY "cohorts_delete_facilitator" ON public.cohorts
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- ARTICLES: Update delete policy
DROP POLICY IF EXISTS "articles_delete_facilitator" ON public.articles;
CREATE POLICY "articles_delete_facilitator" ON public.articles
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- TOOLS: Update delete policy
DROP POLICY IF EXISTS "tools_delete_facilitator" ON public.tools;
CREATE POLICY "tools_delete_facilitator" ON public.tools
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- PROMPTS: Update delete policy
DROP POLICY IF EXISTS "prompts_delete_facilitator" ON public.prompt_library;
CREATE POLICY "prompts_delete_facilitator" ON public.prompt_library
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- MODULES: Update delete policy
DROP POLICY IF EXISTS "modules_delete_facilitator" ON public.modules;
CREATE POLICY "modules_delete_facilitator" ON public.modules
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);