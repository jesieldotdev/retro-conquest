import { useState } from 'react';
import { Trophy, Key, User, ExternalLink, Gamepad2, Zap, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !apiKey.trim()) {
      setError('Fill in both fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), apiKey.trim());
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Invalid credentials. Check your username and Web API Key.');
      } else {
        setError('Connection failed. Try again or check your internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ra-darker flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-ra-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-ra-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ra-gold/5 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(79,110,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-ra-accent/20 border border-ra-accent/30 mb-4 animate-glow">
            <Trophy className="w-10 h-10 text-ra-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Retro<span className="text-gradient-gold">Conquest</span>
          </h1>
          <p className="text-ra-text text-sm">Your RetroAchievements dashboard</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { icon: Gamepad2, label: 'All Games' },
            { icon: Star, label: 'Achievements' },
            { icon: Zap, label: 'Live Stats' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ra-card border border-ra-border text-ra-text text-xs">
              <Icon className="w-3 h-3 text-ra-accent" />
              {label}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Connect your account</h2>
          <p className="text-ra-text text-sm mb-2">
            Need your <span className="text-white font-medium">Web API Key</span> from{' '}
            <a
              href="https://retroachievements.org/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ra-accent hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
            >
              RA Settings <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <div className="mb-5 p-3 rounded-xl bg-ra-accent/10 border border-ra-accent/20 text-xs text-ra-text">
            On the settings page, scroll to <span className="text-white">"Keys"</span> section → copy <span className="text-white">Web API Key</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ra-text mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ra-text/60" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="YourRAUsername"
                  className="w-full bg-ra-darker border border-ra-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-ra-text/40 focus:outline-none focus:border-ra-accent/60 focus:ring-1 focus:ring-ra-accent/30 transition-all text-sm"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ra-text mb-1.5 uppercase tracking-wide">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ra-text/60" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-ra-darker border border-ra-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-ra-text/40 focus:outline-none focus:border-ra-accent/60 focus:ring-1 focus:ring-ra-accent/30 transition-all text-sm font-mono"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-ra-red/10 border border-ra-red/30 text-ra-red text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-ra-red flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #4F6EF7, #7C3AED)',
                boxShadow: '0 4px 15px rgba(79,110,247,0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Connect to RetroAchievements
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-ra-text/50 text-xs mt-6">
          Your credentials are stored locally only
        </p>
      </div>
    </div>
  );
}
