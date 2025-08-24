import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isFacilitator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch profile data for authenticated user
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, !!session);
        
        setLoading(true);
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // Handle authenticated user - fetch profile
        try {
          const profile = await fetchProfile(session.user.id);
          
          if (mounted) {
            setProfile(profile);
            
            // Update last login on sign in
            if (event === 'SIGNED_IN' && profile) {
              await updateLastLogin(session.user.id);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (mounted) {
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Get initial session AFTER setting up the listener
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        // If we already have a session from the listener, don't process it again
        if (session) return;

        console.log('Initial session:', !!initialSession);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const profile = await fetchProfile(initialSession.user.id);
          if (mounted) {
            setProfile(profile);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove session dependency to avoid loops

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
      console.log('Login attempt:', { email, password });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('Sign in successful:', data.user?.id);
      
      // Don't set loading here - let the auth state listener handle it
      return { error: null };
    } catch (error: any) {
      console.error('Sign in catch error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session')) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log('Sign out successful');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      // Force redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      console.log('Sign out error (clearing state anyway):', error);
      
      // Clear state on any error
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });

      // Force redirect on error too
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
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