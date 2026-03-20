'use client';

import { useState } from 'react';
import { unlockTool } from '../actions';

export function PasswordLock({ slug }: { slug: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const success = await unlockTool(slug, password);
      if (success) {
        window.location.reload();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-tools-bg text-tools-fg">
      <div className="w-full max-w-sm p-8 bg-tools-surface border border-tools-border rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-tools-bg border border-tools-border flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Password Required</h2>
        <p className="text-tools-muted text-sm text-center mb-8">
          This micro-tool requires a password to access.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full bg-tools-bg border border-tools-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tools-accent focus:border-tools-accent transition-all placeholder-tools-muted"
          />
          {error && (
            <div className="text-red-500 text-xs font-medium text-center">Incorrect password</div>
          )}
          <button
            disabled={loading || !password}
            type="submit"
            className="w-full bg-tools-accent text-white font-medium py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Unlocking...' : 'Unlock Tool'}
          </button>
        </form>
      </div>
    </div>
  );
}
