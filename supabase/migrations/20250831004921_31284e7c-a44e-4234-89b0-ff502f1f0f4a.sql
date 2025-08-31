-- Update resources table to match articles/news structure
ALTER TABLE public.resources 
  RENAME COLUMN name TO title;

-- Add missing columns
ALTER TABLE public.resources 
  ADD COLUMN image_url text,
  ADD COLUMN video_url text,
  ADD COLUMN parent_id uuid REFERENCES public.resources(id) ON DELETE SET NULL,
  ADD COLUMN metadata jsonb,
  ADD COLUMN json_data jsonb DEFAULT '[]'::jsonb;

-- Drop the screenshot_asset_id column since we're using image_url/video_url
ALTER TABLE public.resources 
  DROP COLUMN screenshot_asset_id;