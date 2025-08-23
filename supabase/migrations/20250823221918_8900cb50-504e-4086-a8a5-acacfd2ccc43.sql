-- Create the missing learning-plan-assets storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learning-plan-assets', 'learning-plan-assets', true);

-- Create the missing content-assets storage bucket for enhanced content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-assets', 'content-assets', true);

-- Create the missing cohort-day-assets storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cohort-day-assets', 'cohort-day-assets', true);

-- Create RLS policies for learning-plan-assets bucket
CREATE POLICY "Learning plan assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'learning-plan-assets');

CREATE POLICY "Authenticated users can upload learning plan assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'learning-plan-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update learning plan assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'learning-plan-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete learning plan assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'learning-plan-assets' AND auth.role() = 'authenticated');

-- Create RLS policies for content-assets bucket
CREATE POLICY "Content assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'content-assets');

CREATE POLICY "Authenticated users can upload content assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'content-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update content assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'content-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete content assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'content-assets' AND auth.role() = 'authenticated');

-- Create RLS policies for cohort-day-assets bucket
CREATE POLICY "Cohort day assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cohort-day-assets');

CREATE POLICY "Authenticated users can upload cohort day assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cohort-day-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cohort day assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cohort-day-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cohort day assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cohort-day-assets' AND auth.role() = 'authenticated');