import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'public' | 'government' | 'facilitator' | 'admin';
  organization?: string;
  department?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; requires_reset?: boolean; user_id?: string; email?: string }>;
  signOut: () => Promise<void>;
  completePasswordReset: (userId: string, email: string, newPassword: string) => Promise<{ error: any }>;
  isAdmin: boolean;
  isFacilitator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with a slight delay to avoid recursion
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              setProfile(profile);
              
              // CRITICAL SECURITY CHECK: If user requires password reset, force logout immediately
              if (profile?.requires_password_reset && profile?.temporary_password_hash) {
                console.log('User requires password reset - forcing logout');
                // Clear everything immediately
                localStorage.clear();
                await supabase.auth.signOut({ scope: 'local' });
                setSession(null);
                setUser(null);
                setProfile(null);
                toast({
                  title: "Password reset required",
                  description: "You must complete the password reset process to access your account.",
                  variant: "destructive",
                });
                navigate('/auth');
                return;
              }
              
              if (profile) {
                // Update last login
                await supabase
                  .from('profiles')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', session.user.id);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Starting signup process for email:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Signup successful, user created:', data.user?.id);
        toast({
          title: "Account created successfully",
          description: "Your account has been created and you can now sign in.",
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Signup catch error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign-in for:', email);
      
      // ALWAYS try verify-login first - it will check for temp password server-side
      // This prevents any information leakage about account status
      const { data, error: verifyError } = await supabase.functions.invoke('verify-login', {
        body: { email, password },
      });

      console.log('verify-login response:', { data, error: verifyError });

      // If verify-login succeeded and requires reset, trigger the reset flow
      if (data?.requires_reset && data?.user_id && data?.email) {
        return { 
          error: null, 
          requires_reset: true, 
          user_id: data.user_id,
          email: data.email 
        };
      }

      // If verify-login says to try normal auth, or if it failed, try normal login
      // This handles cases where user doesn't have temp password requirement
      console.log('Attempting normal auth login');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Normal auth login failed:', error);
        toast({
          title: "Sign in failed",
          description: "Invalid login credentials",
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('signIn catch error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const completePasswordReset = async (userId: string, email: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('complete-password-reset', {
        body: {
          user_id: userId,
          email,
          new_password: newPassword,
        },
      });

      if (error || data.error) {
        toast({
          title: "Password reset failed",
          description: data?.error || error.message,
          variant: "destructive",
        });
        return { error: data?.error || error };
      }

      // Sign in with new password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: newPassword,
      });

      if (signInError) {
        toast({
          title: "Sign in failed",
          description: signInError.message,
          variant: "destructive",
        });
        return { error: signInError };
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // CRITICAL: Force clear localStorage to remove any cached tokens
      // This prevents auto-login from cached JWTs after password reset
      localStorage.clear();
      
      // Then sign out from Supabase (both globally and locally)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        // If global sign out fails (session already deleted), try local only
        console.warn('Global signout failed, clearing local session:', signOutError);
        await supabase.auth.signOut({ scope: 'local' });
      }
      
      // Navigate to home
      navigate('/');
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear everything locally
      localStorage.clear();
      setUser(null);
      setProfile(null);
      setSession(null);
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been signed out locally.",
      });
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isFacilitator = profile?.role === 'facilitator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        completePasswordReset,
        isAdmin,
        isFacilitator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}