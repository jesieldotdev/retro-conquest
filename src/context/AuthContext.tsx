import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { setCredentials as setModuleCredentials, raApi } from '../api/ra';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  login: (username: string, apiKey: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'ra_credentials';

function readStored(): { username: string; apiKey: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { username, apiKey } = JSON.parse(raw);
    if (username && apiKey) return { username, apiKey };
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise synchronously from localStorage — no flash of login page
  const [username, setUsername] = useState<string>(() => {
    const stored = readStored();
    if (stored) {
      setModuleCredentials(stored.username, stored.apiKey);
      return stored.username;
    }
    return '';
  });

  const [apiKey, setApiKey] = useState<string>(() => readStored()?.apiKey ?? '');

  const login = useCallback(async (u: string, k: string) => {
    // Verify credentials before accepting them
    setModuleCredentials(u, k);
    await raApi.getUserPoints(u); // throws if credentials are invalid
    setUsername(u);
    setApiKey(k);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: u, apiKey: k }));
  }, []);

  const logout = useCallback(() => {
    setModuleCredentials('', '');
    setUsername('');
    setApiKey('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!username && !!apiKey,
      username,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
