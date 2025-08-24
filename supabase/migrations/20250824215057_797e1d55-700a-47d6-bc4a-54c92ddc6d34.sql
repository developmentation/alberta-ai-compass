-- Create articles table (without stars_rating column)
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  json_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  level difficulty_level NOT NULL,
  status content_status NOT NULL DEFAULT 'draft'::content_status,
  language TEXT DEFAULT 'English'::text,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policies for articles (same as news)
CREATE POLICY "articles_crud_facilitator" 
ON public.articles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['facilitator'::user_role, 'admin'::user_role])
  )
) 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "articles_select_published" 
ON public.articles 
FOR SELECT 
USING (
  status = 'published'::content_status 
  AND is_active = true 
  AND deleted_at IS NULL
);

-- Create trigger for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();