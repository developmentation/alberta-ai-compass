-- Add content collection support to learning plans
ALTER TABLE learning_plans ADD COLUMN IF NOT EXISTS content_items jsonb DEFAULT '[]'::jsonb;

-- Update cohort_content table to support day-based organization
ALTER TABLE cohort_content ADD COLUMN IF NOT EXISTS day_name text;
ALTER TABLE cohort_content ADD COLUMN IF NOT EXISTS day_description text;
ALTER TABLE cohort_content ADD COLUMN IF NOT EXISTS day_image_url text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cohort_content_day_number ON cohort_content(cohort_id, day_number);
CREATE INDEX IF NOT EXISTS idx_learning_plans_content ON learning_plans USING GIN(content_items);