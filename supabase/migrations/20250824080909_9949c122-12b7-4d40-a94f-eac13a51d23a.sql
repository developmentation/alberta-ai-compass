-- Create cohort discussions table
CREATE TABLE public.cohort_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  parent_id UUID NULL, -- For threaded replies
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Add foreign key constraints
ALTER TABLE public.cohort_discussions 
ADD CONSTRAINT cohort_discussions_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES public.cohort_discussions(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.cohort_discussions ENABLE ROW LEVEL SECURITY;

-- Create policies for cohort discussions
CREATE POLICY "Users can view discussions of cohorts they are members of" 
ON public.cohort_discussions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM cohort_members cm 
    WHERE cm.cohort_id = cohort_discussions.cohort_id 
    AND (cm.user_id = auth.uid() OR cm.email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can create discussions in cohorts they are members of" 
ON public.cohort_discussions 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM cohort_members cm 
    WHERE cm.cohort_id = cohort_discussions.cohort_id 
    AND (cm.user_id = auth.uid() OR cm.email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can update their own discussions" 
ON public.cohort_discussions 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can soft delete their own discussions" 
ON public.cohort_discussions 
FOR UPDATE 
USING (user_id = auth.uid() AND deleted_at IS NULL) 
WITH CHECK (user_id = auth.uid());

-- Facilitators can manage all cohort discussions
CREATE POLICY "Facilitators can manage all cohort discussions" 
ON public.cohort_discussions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilitator', 'admin')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_cohort_discussions_cohort_id ON public.cohort_discussions(cohort_id);
CREATE INDEX idx_cohort_discussions_user_id ON public.cohort_discussions(user_id);
CREATE INDEX idx_cohort_discussions_parent_id ON public.cohort_discussions(parent_id);
CREATE INDEX idx_cohort_discussions_created_at ON public.cohort_discussions(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_cohort_discussions_updated_at
BEFORE UPDATE ON public.cohort_discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();