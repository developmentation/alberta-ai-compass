-- Update star ratings policy to allow public access
DROP POLICY IF EXISTS "Star ratings are viewable by authenticated users" ON star_ratings;

CREATE POLICY "Star ratings are publicly viewable" 
ON star_ratings 
FOR SELECT 
USING (true);