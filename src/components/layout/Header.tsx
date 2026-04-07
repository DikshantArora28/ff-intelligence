'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ff-dark-mode');
    if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('ff-dark-mode', String(next));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border" style={{ background: 'var(--header-bg)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <h1 className="text-lg font-semibold">F&F Intelligence</h1>
          </div>
          <span className="text-xs text-muted bg-muted/10 px-2 py-0.5 rounded-full">Market Analytics Platform</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className="relative w-14 h-7 rounded-full bg-gray-200 transition-colors duration-300 focus:outline-none"
          style={{ backgroundColor: dark ? '#334155' : '#e2e8f0' }}
          aria-label="Toggle dark mode"
        >
          <div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300"
            style={{ transform: dark ? 'translateX(30px)' : 'translateX(2px)', backgroundColor: dark ? '#1e293b' : '#ffffff' }}
          >
            <span className="text-xs">{dark ? '🌙' : '☀️'}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
