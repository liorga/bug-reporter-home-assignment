import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { apiClient } from '../../api/client';
import type { AuthUser, AuthState } from './models/index';

interface AuthContextValue extends AuthState {
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.checkStatus(email);

      if (response.status === 'blacklisted') {
        setUser(null);
        setError(
          response.reason ?? 'Your account has been blacklisted.'
        );
        return;
      }

      setUser({
        email,
        status: response.status,
      });
    } catch (err) {
      setUser(null);
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login,
      logout,
      isAdmin: user?.status === 'admin',
      isAuthenticated: user !== null,
    }),
    [user, isLoading, error, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
