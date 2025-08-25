-- Allow facilitators and admins to update any content record (for soft deletes and regular updates)
-- Update UPDATE policies to remove created_by restrictions

-- NEWS: Update update policy to allow any facilitator/admin to update any record
DROP POLICY IF EXISTS "news_crud_facilitator" ON public.news;
CREATE POLICY "news_crud_facilitator" ON public.news
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

-- LEARNING PLANS: Update policy
DROP POLICY IF EXISTS "plans_crud_facilitator" ON public.learning_plans;
CREATE POLICY "plans_crud_facilitator" ON public.learning_plans
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

-- COHORTS: Update policy
DROP POLICY IF EXISTS "cohorts_crud_facilitator" ON public.cohorts;
CREATE POLICY "cohorts_crud_facilitator" ON public.cohorts
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

-- ARTICLES: Update policy
DROP POLICY IF EXISTS "articles_crud_facilitator" ON public.articles;
CREATE POLICY "articles_crud_facilitator" ON public.articles
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

-- TOOLS: Update policy
DROP POLICY IF EXISTS "tools_crud_facilitator" ON public.tools;
CREATE POLICY "tools_crud_facilitator" ON public.tools
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

-- PROMPTS: Update policy  
DROP POLICY IF EXISTS "prompts_crud_facilitator" ON public.prompt_library;
CREATE POLICY "prompts_crud_facilitator" ON public.prompt_library
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

-- MODULES: Update policies to allow any facilitator/admin to perform any operation
DROP POLICY IF EXISTS "modules_insert_facilitator" ON public.modules;
DROP POLICY IF EXISTS "modules_update_facilitator" ON public.modules; 
DROP POLICY IF EXISTS "modules_delete_facilitator" ON public.modules;

CREATE POLICY "modules_crud_facilitator" ON public.modules
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