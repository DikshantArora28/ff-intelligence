'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthStore {
  isAuthenticated: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthStore | null>(null);

const VALID_ID = 'F&F';
const VALID_PASSWORD = 'F&F74';
const AUTH_KEY = 'ff-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved === 'true') setIsAuthenticated(true);
    } catch { /* */ }
  }, []);

  function login(id: string, password: string): boolean {
    if (id === VALID_ID && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      try { localStorage.setItem(AUTH_KEY, 'true'); } catch { /* */ }
      return true;
    }
    return false;
  }

  function logout() {
    setIsAuthenticated(false);
    try { localStorage.removeItem(AUTH_KEY); } catch { /* */ }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
