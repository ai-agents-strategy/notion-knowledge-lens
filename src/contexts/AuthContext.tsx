
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  login: typeof supabase.auth.signInWithPassword;
  signUp: typeof supabase.auth.signUp;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>; // New method for Google sign-in
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (_event === 'SIGNED_IN' && session?.provider_token) { // Redirect after OAuth sign-in
          navigate('/settings');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to home page after logout
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`, // Important: must be an allowed redirect URI in Supabase
      },
    });
    if (error) {
      console.error('Google Sign-In error:', error);
      // You might want to show a toast notification here
    }
  };
  
  const value = {
    session,
    user,
    isLoading,
    login: supabase.auth.signInWithPassword,
    signUp: (params) => supabase.auth.signUp({
      ...params,
      options: {
        ...params.options,
        emailRedirectTo: `${window.location.origin}/`,
      }
    }),
    logout,
    signInWithGoogle, // Add new method to context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
