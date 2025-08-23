-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('media-assets', 'media-assets', true),
  ('module-assets', 'module-assets', true),
  ('cohort-assets', 'cohort-assets', true);

-- Create storage policies for media uploads
CREATE POLICY "Media assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('media-assets', 'module-assets', 'cohort-assets'));

CREATE POLICY "Facilitators can upload media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id IN ('media-assets', 'module-assets', 'cohort-assets') AND 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin')));

CREATE POLICY "Facilitators can update media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id IN ('media-assets', 'module-assets', 'cohort-assets') AND 
       EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin')));

-- Add image and video fields to content tables
ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE learning_plans ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE learning_plans ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE tools ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE prompt_library ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create modules table for learning modules
CREATE TABLE IF NOT EXISTS modules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    description TEXT,
    json_data JSONB NOT NULL,
    language TEXT DEFAULT 'English',
    level difficulty_level DEFAULT 'beginner',
    status content_status DEFAULT 'draft',
    image_url TEXT,
    video_url TEXT,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Create policies for modules
CREATE POLICY "modules_crud_facilitator" 
ON modules 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin')))
WITH CHECK (created_by = auth.uid());

CREATE POLICY "modules_select_published" 
ON modules 
FOR SELECT 
USING (status = 'published' AND deleted_at IS NULL);

-- Create cohort_content table for organizing content by day
CREATE TABLE IF NOT EXISTS cohort_content (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id UUID NOT NULL REFERENCES cohorts(id),
    content_type TEXT NOT NULL CHECK (content_type IN ('learning_plan', 'module', 'tool', 'news', 'prompt')),
    content_id UUID NOT NULL,
    day_number INTEGER NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(cohort_id, content_type, content_id, day_number)
);

-- Enable RLS on cohort_content
ALTER TABLE cohort_content ENABLE ROW LEVEL SECURITY;

-- Create policies for cohort_content
CREATE POLICY "cohort_content_facilitator" 
ON cohort_content 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin')))
WITH CHECK (created_by = auth.uid());

-- Add model_names to api_keys table
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS model_names TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS description TEXT;