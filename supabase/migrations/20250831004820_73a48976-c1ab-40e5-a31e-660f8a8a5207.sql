-- Create resources table from scratch with proper structure
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL, -- Keep URL for third-party resource links
  image_url text,
  video_url text,
  parent_id uuid REFERENCES public.resources(id) ON DELETE SET NULL,
  level difficulty_level NOT NULL,
  language text DEFAULT 'English',
  status content_status NOT NULL DEFAULT 'draft',
  is_active boolean DEFAULT true,
  stars_rating numeric DEFAULT 0,
  metadata jsonb,
  json_data jsonb DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies matching other content tables
CREATE POLICY "resources_crud_facilitator" 
ON public.resources 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role IN ('facilitator', 'admin')
))
WITH CHECK (created_by = auth.uid());

CREATE POLICY "resources_select_published" 
ON public.resources 
FOR SELECT 
USING (status = 'published' AND is_active = true AND deleted_at IS NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();