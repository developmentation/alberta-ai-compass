-- Update cohort_content table to support articles and nullable content_id
ALTER TABLE public.cohort_content 
ALTER COLUMN content_id DROP NOT NULL;

-- Drop the existing check constraint
ALTER TABLE public.cohort_content 
DROP CONSTRAINT IF EXISTS cohort_content_content_type_check;

-- Add updated check constraint that includes 'article'
ALTER TABLE public.cohort_content 
ADD CONSTRAINT cohort_content_content_type_check 
CHECK (content_type IN ('modules', 'news', 'tools', 'prompts', 'learning_plans', 'article', 'day'));