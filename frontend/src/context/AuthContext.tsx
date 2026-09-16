import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authApi } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role?: string; organization?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('bis_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        localStorage.removeItem('bis_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('bis_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (data: { email: string; password: string; name: string; role?: string; organization?: string }) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      localStorage.setItem('bis_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('bis_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
