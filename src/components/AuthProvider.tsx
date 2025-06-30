import { ReactNode } from 'react';
import { AuthContext, useProvideAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useProvideAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
