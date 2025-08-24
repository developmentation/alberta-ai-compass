-- Add missing video_url column to prompt_library table
ALTER TABLE prompt_library ADD COLUMN IF NOT EXISTS video_url text;