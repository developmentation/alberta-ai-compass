-- Create ai_mentor table for chat history
CREATE TABLE public.ai_mentor (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_mentor ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can only see their own chat history
CREATE POLICY "Users can view their own ai_mentor chats" 
ON public.ai_mentor 
FOR SELECT 
USING (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own ai_mentor chats" 
ON public.ai_mentor 
FOR INSERT 
WITH CHECK (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own ai_mentor chats" 
ON public.ai_mentor 
FOR UPDATE 
USING (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own ai_mentor chats" 
ON public.ai_mentor 
FOR DELETE 
USING (user_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_ai_mentor_updated_at
BEFORE UPDATE ON public.ai_mentor
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();