-- Update the difficulty_level enum to support the new level system
ALTER TYPE difficulty_level RENAME TO difficulty_level_old;

CREATE TYPE difficulty_level AS ENUM ('1', '2', '3', 'RED');

-- Update existing tables to use the new enum
ALTER TABLE modules ALTER COLUMN level DROP DEFAULT;
ALTER TABLE modules ALTER COLUMN level TYPE difficulty_level USING 
  CASE level::text 
    WHEN 'beginner' THEN '1'::difficulty_level
    WHEN 'intermediate' THEN '2'::difficulty_level  
    WHEN 'advanced' THEN '3'::difficulty_level
    ELSE '1'::difficulty_level
  END;
ALTER TABLE modules ALTER COLUMN level SET DEFAULT '1';

-- Clean up old type
DROP TYPE difficulty_level_old;