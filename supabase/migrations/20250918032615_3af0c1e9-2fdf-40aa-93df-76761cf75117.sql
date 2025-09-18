-- Create storage bucket for cohort assignments
INSERT INTO storage.buckets (id, name, public) VALUES ('cohort-assignments', 'cohort-assignments', false);

-- Create cohort_assignments table
CREATE TABLE public.cohort_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id UUID NOT NULL,
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    content_type TEXT,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on cohort_assignments table
ALTER TABLE public.cohort_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for cohort_assignments table
-- Users can view their own assignments
CREATE POLICY "Users can view their own cohort assignments"
ON public.cohort_assignments
FOR SELECT
USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Facilitators and admins can view all assignments
CREATE POLICY "Facilitators and admins can view all cohort assignments"
ON public.cohort_assignments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('facilitator', 'admin')
    )
    AND deleted_at IS NULL
);

-- Users can insert their own assignments
CREATE POLICY "Users can insert their own cohort assignments"
ON public.cohort_assignments
FOR INSERT
WITH CHECK (
    user_id = auth.uid() 
    AND created_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM cohort_members cm
        WHERE cm.cohort_id = cohort_assignments.cohort_id
        AND (cm.user_id = auth.uid() OR cm.email = (SELECT email FROM profiles WHERE id = auth.uid()))
        AND cm.status = 'enrolled'
    )
);

-- Users can update their own assignments (for soft delete)
CREATE POLICY "Users can update their own cohort assignments"
ON public.cohort_assignments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Facilitators and admins can manage all assignments
CREATE POLICY "Facilitators and admins can manage all cohort assignments"
ON public.cohort_assignments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('facilitator', 'admin')
    )
);

-- Storage policies for cohort-assignments bucket
-- Users can upload files to their own folder
CREATE POLICY "Users can upload their own assignment files"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'cohort-assignments'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view their own assignment files"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'cohort-assignments'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own assignment files"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'cohort-assignments'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Facilitators and admins can view all files
CREATE POLICY "Facilitators and admins can view all assignment files"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'cohort-assignments'
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('facilitator', 'admin')
    )
);

-- Facilitators and admins can delete all files
CREATE POLICY "Facilitators and admins can delete all assignment files"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'cohort-assignments'
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('facilitator', 'admin')
    )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_cohort_assignments_updated_at
    BEFORE UPDATE ON public.cohort_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();