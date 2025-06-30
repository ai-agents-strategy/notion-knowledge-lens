import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user, isLoaded } = useAuth();
  return { user, isLoaded, isSignedIn: !!user };
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoaded(true);

      // Create profile for new users (especially OAuth users)
      if (session?.user && !session.user.user_metadata?.profile_created) {
        createUserProfile(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.id || 'no user');
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoaded(true);

      // Handle sign-in events (including OAuth)
      if (event === 'SIGNED_IN' && session?.user) {
        await createUserProfile(session.user);
      }

      // Handle sign-out events
      if (event === 'SIGNED_OUT') {
        console.log('🔐 User signed out, clearing local data');
        // Clear any cached data
        setUser(null);
        setSession(null);
        // Optionally clear localStorage if needed
        // localStorage.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // Check if profile already exists using maybeSingle() instead of single()
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile for new user
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            user_email: user.email || '',
          });

        if (error) {
          console.error('Error creating user profile:', error);
        } else {
          console.log('User profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      console.log('✅ Sign out successful');
      
      // Optional: Clear localStorage if you want to remove all cached data
      // localStorage.clear();
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      // Even if there's an error, try to clear local state and redirect
      setUser(null);
      setSession(null);
      window.location.href = '/';
    }
  };

  return {
    user,
    session,
    isLoaded,
    isSignedIn: !!user,
    signOut,
  };
};

export { AuthContext };