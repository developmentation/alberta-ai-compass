-- Drop and recreate the function with proper search path to access auth schema
DROP FUNCTION IF EXISTS public.delete_user_sessions(uuid);

CREATE OR REPLACE FUNCTION public.delete_user_sessions(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'auth, public'
AS $$
BEGIN
  -- Delete all sessions for this user from auth schema
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  
  -- Delete all refresh tokens for this user from auth schema
  DELETE FROM auth.refresh_tokens WHERE user_id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error deleting sessions for user %: %', target_user_id, SQLERRM;
    RETURN false;
END;
$$;