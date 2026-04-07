'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authStore';

interface Props {
  children: React.ReactNode;
  feature: string; // e.g. "Seasonality" or "Forecasting"
}

export default function AuthGate({ children, feature }: Props) {
  const { isAuthenticated, login } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <>{children}</>;
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const success = login(id, password);
    if (!success) {
      setError('Invalid ID or Password');
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 w-full max-w-sm shadow-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-white text-xl">🔒</span>
          </div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Authentication Required</h2>
          <p className="text-sm text-[var(--muted)] mt-1">Sign in to access {feature}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block mb-1.5">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your ID"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-xs text-red-500 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
