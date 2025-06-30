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
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoaded(true);

      // Handle sign-in events (including OAuth)
      if (event === 'SIGNED_IN' && session?.user) {
        await createUserProfile(session.user);
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
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile for new user
        const { error } = await supabase
          .from('profiles')
          .insert({
            clerk_user_id: user.id,
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
    await supabase.auth.signOut();
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