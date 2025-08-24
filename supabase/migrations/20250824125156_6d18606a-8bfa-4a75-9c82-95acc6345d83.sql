-- Add visit tracking columns to cohort_members table
ALTER TABLE cohort_members 
ADD COLUMN first_visit TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_visit TIMESTAMP WITH TIME ZONE;