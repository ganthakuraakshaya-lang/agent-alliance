import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AuthSession } from '../types/fir';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
  sessionExpiredNotice?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, sessionExpiredNotice }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(sessionExpiredNotice || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please provide both username and password.');
      return;
    }

    setLoading(true);
    try {
      const session = await api.login(username.trim(), password);
      onLoginSuccess(session);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-black border-2 border-[#A38F58] flex items-center justify-center shadow-sm">
            <Shield className="w-7 h-7 text-[#A38F58]" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-black uppercase">
          FIR ANALYZER AGENTIC AI
        </h1>
        <p className="mt-1 text-center text-xs tracking-widest text-[#A38F58] uppercase font-semibold">
          Authorized Police Officer Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-black/20 shadow-sm">
          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3 border-2 border-black bg-black/5 text-xs text-black font-medium flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-[#A38F58] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-black uppercase tracking-wider">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full border border-black/30 px-3 py-2 text-sm text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58]"
                  placeholder="Enter authorized username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-black uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full border border-black/30 px-3 py-2 pr-10 text-sm text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58]"
                  placeholder="Enter authorized password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-black/50 hover:text-black focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-[#A38F58] text-sm font-semibold text-black bg-[#A38F58] hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A38F58] transition-colors disabled:opacity-50 tracking-wider uppercase"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-black/10 text-center text-[11px] text-black/60">
            Authorized Demonstration Access &middot; Server Environment Configured
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-black/50">
          Decision Support System for Authorized Police Officers &middot; Confidentially Controlled
        </div>
      </div>
    </div>
  );
};
