-- Fix delete issues by properly separating RLS policies for different operations
-- and add aggregate access policies for user-specific tables

-- Drop existing problematic policies that combine operations
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can manage their own ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can create their own completions" ON public.user_completions;
DROP POLICY IF EXISTS "Users can view their own completions" ON public.user_completions;

-- Create separate policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON public.user_bookmarks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_bookmarks
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.user_bookmarks
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow aggregate access to bookmark counts for all authenticated users
CREATE POLICY "Authenticated users can view bookmark aggregates" ON public.user_bookmarks
FOR SELECT USING (auth.role() = 'authenticated');

-- Create separate policies for user_ratings
CREATE POLICY "Users can view their own ratings" ON public.user_ratings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings" ON public.user_ratings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.user_ratings
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON public.user_ratings
FOR DELETE USING (auth.uid() = user_id);

-- Allow aggregate access to rating data for all authenticated users
CREATE POLICY "Authenticated users can view rating aggregates" ON public.user_ratings
FOR SELECT USING (auth.role() = 'authenticated');

-- Create separate policies for user_completions
CREATE POLICY "Users can view their own completions" ON public.user_completions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON public.user_completions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow aggregate access to completion data for all authenticated users
CREATE POLICY "Authenticated users can view completion aggregates" ON public.user_completions
FOR SELECT USING (auth.role() = 'authenticated');

-- Keep existing facilitator policy for user_completions
-- (Facilitators can view all completions policy already exists)