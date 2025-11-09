-- Create function to delete all sessions and refresh tokens for a user
-- This is needed because the Supabase client's signOut method doesn't work with user IDs
CREATE OR REPLACE FUNCTION public.delete_user_sessions(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete all sessions for this user
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  
  -- Delete all refresh tokens for this user
  DELETE FROM auth.refresh_tokens WHERE user_id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error deleting sessions for user %: %', target_user_id, SQLERRM;
    RETURN false;
END;
$$;