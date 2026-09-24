import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi, type User } from '../lib/api';
import { Sparkle } from '../components/ui/Logo';

type Status = 'loading' | 'signed-in' | 'signed-out';

interface AuthState {
  user: User | null;
  status: Status;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

/** Session state. The session itself lives in an httpOnly cookie the browser manages. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    setStatus(u ? 'signed-in' : 'signed-out');
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const onUnauthorized = () => setUser(null);
    window.addEventListener('ideaforge:unauthorized', onUnauthorized);
    return () => window.removeEventListener('ideaforge:unauthorized', onUnauthorized);
  }, [refresh, setUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const value = useMemo(() => ({ user, status, setUser, logout, refresh }), [user, status, setUser, logout, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Wraps private pages: signed-out visitors are sent to log in and brought back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center" role="status" aria-label="Checking your session">
        <Sparkle className="size-10" animated />
      </div>
    );
  }
  if (status === 'signed-out') {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
}

/** Only allows same-site relative redirects after login (prevents open redirects). */
export function safeNext(next: string | null, fallback = '/projects') {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
