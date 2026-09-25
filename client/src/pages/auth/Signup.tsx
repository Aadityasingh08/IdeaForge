import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '../../lib/api';
import { safeNext, useAuth } from '../../state/AuthContext';
import { Input } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { AuthLayout, FormError, PasswordField, PasswordRules, passwordValid } from './AuthLayout';

export default function Signup() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const { status, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const resuming = next === '/new-idea';

  useEffect(() => {
    document.title = 'Create your account · IdeaForge';
  }, []);

  if (status === 'signed-in') return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Tell us your name.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (!passwordValid(password)) return setError('Choose a password with at least 8 characters, including a letter and a number.');
    if (!agreed) return setError('Please accept the terms and cookie policy to continue.');
    setBusy(true);
    setError(null);
    try {
      setUser(await authApi.signup({ name: name.trim(), email: email.trim(), password, remember: true }));
      navigate(next, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={resuming ? 'One quick step — your idea is saved and we’ll start shaping it right after.' : 'Free to use. Your brands stay private to your account.'}
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-mint-dark hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {resuming && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-mint-50 px-3.5 py-2.5 text-sm font-medium text-mint-dark">
          <Sparkles className="size-4" aria-hidden /> Your idea is saved.
        </p>
      )}
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={error} />
        {error && (error.toLowerCase().includes('already exists') || error.toLowerCase().includes('log in')) && (
          <div className="flex items-center justify-between rounded-xl border border-mint/20 bg-mint-50/70 p-3 text-xs text-ink-heading">
            <span>Already registered with this email?</span>
            <Link to={`/login?email=${encodeURIComponent(email.trim())}${params.get('next') ? `&next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-mint-dark hover:underline">
              Go to Log in &rarr;
            </Link>
          </div>
        )}
        <Input label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoFocus />
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <div>
          <PasswordField label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} />
          <PasswordRules value={password} />
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug text-body">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 shrink-0 rounded accent-[#0f766e]" />
          <span>
            I agree to the terms and the{' '}
            <Link to="/cookies" className="font-semibold text-mint-dark hover:underline">
              cookie policy
            </Link>
            . We only use an essential cookie to keep you signed in.
          </span>
        </label>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} iconRight={<ArrowRight className="size-4" />}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
