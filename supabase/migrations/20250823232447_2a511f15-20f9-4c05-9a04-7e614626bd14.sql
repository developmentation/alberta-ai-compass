-- Create user_bookmarks table for any content type
CREATE TABLE public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Create user_ratings table to track individual user ratings
CREATE TABLE public.user_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Create star_ratings table for aggregated ratings
CREATE TABLE public.star_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  total_votes INTEGER NOT NULL DEFAULT 0,
  total_stars INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_id, content_type)
);

-- Create user_completions table to track completion
CREATE TABLE public.user_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score NUMERIC(5,2), -- Optional score for quizzes/assessments
  metadata JSONB, -- Additional completion data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Enable RLS on all tables
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
ON public.user_bookmarks 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_ratings
CREATE POLICY "Users can manage their own ratings" 
ON public.user_ratings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for star_ratings (readable by all authenticated users)
CREATE POLICY "Star ratings are viewable by authenticated users" 
ON public.star_ratings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_completions
CREATE POLICY "Users can view their own completions" 
ON public.user_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" 
ON public.user_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Facilitators can view all completions" 
ON public.user_completions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role = ANY(ARRAY['facilitator'::user_role, 'admin'::user_role])
));

-- Function to update star ratings when user ratings change
CREATE OR REPLACE FUNCTION public.update_star_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.star_ratings (content_id, content_type, total_votes, total_stars, average_rating)
    SELECT 
      NEW.content_id,
      NEW.content_type,
      COUNT(*),
      SUM(rating),
      ROUND(AVG(rating), 2)
    FROM public.user_ratings 
    WHERE content_id = NEW.content_id AND content_type = NEW.content_type
    ON CONFLICT (content_id, content_type) 
    DO UPDATE SET
      total_votes = EXCLUDED.total_votes,
      total_stars = EXCLUDED.total_stars,
      average_rating = EXCLUDED.average_rating,
      updated_at = now();
    
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE public.star_ratings 
    SET 
      total_votes = COALESCE((
        SELECT COUNT(*) 
        FROM public.user_ratings 
        WHERE content_id = OLD.content_id AND content_type = OLD.content_type
      ), 0),
      total_stars = COALESCE((
        SELECT SUM(rating) 
        FROM public.user_ratings 
        WHERE content_id = OLD.content_id AND content_type = OLD.content_type
      ), 0),
      average_rating = COALESCE((
        SELECT ROUND(AVG(rating), 2) 
        FROM public.user_ratings 
        WHERE content_id = OLD.content_id AND content_type = OLD.content_type
      ), 0),
      updated_at = now()
    WHERE content_id = OLD.content_id AND content_type = OLD.content_type;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic star rating updates
CREATE TRIGGER update_star_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_star_ratings();

-- Add updated_at trigger for user_ratings
CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();