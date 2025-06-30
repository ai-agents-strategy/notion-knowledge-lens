import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
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

  // Enhanced session refresh function
  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing auth session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session refresh error:', error);
        setSession(null);
        setUser(null);
        return;
      }

      console.log('✅ Session refreshed:', session ? 'Valid session' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      // If we have a session, ensure profile exists
      if (session?.user) {
        await ensureUserProfile(session.user);
      }
    } catch (error) {
      console.error('❌ Unexpected error during session refresh:', error);
      setSession(null);
      setUser(null);
    }
  };

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('👤 Ensuring user profile exists for:', user.id);
      
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        console.log('➕ Creating new user profile...');
        
        // Extract user info from metadata or email
        const userName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        '';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            user_name: userName,
            user_email: user.email || '',
          });

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError);
        } else {
          console.log('✅ User profile created successfully');
        }
      } else {
        console.log('✅ User profile already exists');
      }
    } catch (error) {
      console.error('❌ Unexpected error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth state...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session initialization timeout')), 30000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]) as { data: { session: Session | null }, error: Error | null };

        if (!mounted) return;

        if (error) {
          console.error('❌ Initial session error:', error);
          setSession(null);
          setUser(null);
        } else {
          console.log('✅ Initial session loaded:', session ? 'Valid session' : 'No session');
          setSession(session);
          setUser(session?.user ?? null);

          // Create profile for authenticated users
          if (session?.user) {
            await ensureUserProfile(session.user);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes with improved error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 Auth state change:', event, session?.user?.id || 'no user');
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoaded(true);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in');
            if (session?.user) {
              await ensureUserProfile(session.user);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 User signed out, clearing local data');
            setUser(null);
            setSession(null);
            // Clear any cached data if needed
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed');
            break;
            
          case 'USER_UPDATED':
            console.log('👤 User updated');
            if (session?.user) {
              await ensureUserProfile(session.user);
            }
            break;
            
          default:
            console.log('🔐 Auth event:', event);
        }
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔐 Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 10000)
      );

      const { error } = await Promise.race([
        signOutPromise, 
        timeoutPromise
      ]) as { error: Error | null };
      
      if (error) {
        console.error('❌ Sign out error:', error);
        // Don't throw error, still redirect
      }
      
      console.log('✅ Sign out completed');
      
      // Clear localStorage if needed
      localStorage.removeItem('notion_synced_databases');
      localStorage.removeItem('notion_last_sync');
      localStorage.removeItem('notion_graph_nodes');
      localStorage.removeItem('notion_graph_connections');
      
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
    refreshSession,
  };
};

export { AuthContext };
