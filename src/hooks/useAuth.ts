import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const useProvideAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const ensureUserProfile = useCallback(async (userToEnsure: User) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userToEnsure.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProfile) {
        const userName =
          userToEnsure.user_metadata?.full_name ||
          userToEnsure.user_metadata?.name ||
          userToEnsure.email?.split('@')[0] ||
          'New User';

        const { error: insertError } = await supabase.from('profiles').insert({
          user_id: userToEnsure.id,
          user_name: userName,
          user_email: userToEnsure.email || '',
        });

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      // Error is intentionally not handled to avoid user-facing errors.
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoaded(true);

      if (event === 'SIGNED_IN' && newSession?.user) {
        await ensureUserProfile(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('notion_synced_databases');
        localStorage.removeItem('notion_last_sync');
        localStorage.removeItem('notion_graph_nodes');
        localStorage.removeItem('notion_graph_connections');
      } else if (event === 'USER_UPDATED' && newSession?.user) {
        await ensureUserProfile(newSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ensureUserProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error) {
      setSession(data.session);
      setUser(data.user ?? null);
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
