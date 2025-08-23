-- Fix the function security issue by adding proper search path
CREATE OR REPLACE FUNCTION public.update_star_ratings()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
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
$$;