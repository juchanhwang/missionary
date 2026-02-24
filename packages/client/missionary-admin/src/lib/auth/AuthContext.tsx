'use client';

import { useSafeContext } from '@samilhero/design-system';
import { type AuthUser } from 'apis/auth';
import { useLogoutAction, useSuspenseGetMe } from 'hooks/auth';
import { createContext } from 'react';

interface AuthContextValue {
  user: AuthUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = 'AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useSuspenseGetMe();
  const logoutMutation = useLogoutAction();

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useSafeContext(AuthContext);
}
