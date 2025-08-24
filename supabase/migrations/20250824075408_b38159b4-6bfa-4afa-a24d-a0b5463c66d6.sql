-- Create cohort_members table to track user enrollment in cohorts
CREATE TABLE public.cohort_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'pending', 'completed', 'dropped')),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enrolled_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(cohort_id, email)
);

-- Enable Row Level Security
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- Policy: Facilitators/admins can manage all cohort members
CREATE POLICY "cohort_members_facilitator_crud" 
ON public.cohort_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('facilitator', 'admin')
  )
) 
WITH CHECK (enrolled_by = auth.uid());

-- Policy: Users can view their own cohort memberships
CREATE POLICY "cohort_members_own_select" 
ON public.cohort_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Policy: Users in the same cohort can see other members
CREATE POLICY "cohort_members_cohort_select" 
ON public.cohort_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM cohort_members cm 
    WHERE cm.cohort_id = cohort_members.cohort_id 
    AND (cm.user_id = auth.uid() OR cm.email = (SELECT email FROM profiles WHERE id = auth.uid()))
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cohort_members_updated_at
  BEFORE UPDATE ON public.cohort_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();