import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Permissions } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  permissions: Permissions | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('vte_token');
    const savedUser = localStorage.getItem('vte_user');
    const savedPerms = localStorage.getItem('vte_permissions');

    if (savedToken && savedUser && savedPerms) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setPermissions(JSON.parse(savedPerms));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const resp = await authApi.login(username, password);
      const { token: t, user: u, permissions: p } = resp.data.data;
      setToken(t);
      setUser(u);
      setPermissions(p);
      localStorage.setItem('vte_token', t);
      localStorage.setItem('vte_user', JSON.stringify(u));
      localStorage.setItem('vte_permissions', JSON.stringify(p));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || '登录失败，请检查网络连接',
      };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setPermissions(null);
    localStorage.removeItem('vte_token');
    localStorage.removeItem('vte_user');
    localStorage.removeItem('vte_permissions');
  }, []);

  return (
    <AuthContext.Provider value={{
      user, permissions, token,
      isAuthenticated: !!token && !!user,
      loading, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
