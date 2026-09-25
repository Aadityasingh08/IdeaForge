import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { authApi } from '../../lib/api';
import { safeNext, useAuth } from '../../state/AuthContext';
import { Input } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { AuthLayout, FormError, PasswordField } from './AuthLayout';

export default function Login() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const { status, setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => params.get('email') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Log in · IdeaForge';
  }, []);

  if (status === 'signed-in') return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError(null);
    try {
      setUser(await authApi.login({ email: email.trim(), password, remember }));
      navigate(next, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue shaping your brands."
      footer={
        <>
          New to IdeaForge?{' '}
          <Link to={`/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-mint-dark hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={error} />
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 rounded accent-[#0f766e]" />
            Remember me for 30 days
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-mint-dark hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} iconRight={<ArrowRight className="size-4" />}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
