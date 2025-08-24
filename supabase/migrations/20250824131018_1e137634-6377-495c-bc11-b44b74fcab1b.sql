-- Fix foreign key relationship for cohort_discussions
-- Add proper foreign key constraint between cohort_discussions and profiles
ALTER TABLE cohort_discussions 
ADD CONSTRAINT fk_cohort_discussions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;