import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useAuth } from '../../state/AuthContext';
import { Input } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { AuthLayout, FormError, PasswordField, PasswordRules, passwordValid } from './AuthLayout';

const back = (
  <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-mint-dark hover:underline">
    <ArrowLeft className="size-3.5" aria-hidden /> Back to log in
  </Link>
);

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Reset your password · IdeaForge';
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    setBusy(true);
    setError(null);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we’ll send you a link to choose a new one." footer={back}>
      {sent ? (
        <div className="rounded-2xl border border-[#a7f3d0] bg-[#f0fdf9] p-5" role="status">
          <MailCheck className="size-6 text-success" aria-hidden />
          <p className="mt-3 font-semibold text-ink">Check your inbox</p>
          <p className="mt-1 text-sm leading-relaxed text-body">If an account exists for {email.trim()}, a reset link is on its way. It expires in 30 minutes.</p>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Running IdeaForge locally without an email service? The link is printed in the server console.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <FormError message={error} />
          <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Choose a new password · IdeaForge';
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordValid(password)) return setError('Choose a password with at least 8 characters, including a letter and a number.');
    if (password !== confirm) return setError('The passwords don’t match.');
    setBusy(true);
    setError(null);
    try {
      setUser(await authApi.resetPassword(token, password));
      navigate('/projects', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="This link isn’t complete" subtitle="Open the full link from your email, or request a new one." footer={back}>
        <Link to="/forgot-password" className="font-semibold text-mint-dark hover:underline">
          Request a new reset link →
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="For your security, you’ll be signed out on every other device." footer={back}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={error} />
        <div>
          <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          <PasswordRules value={password} />
        </div>
        <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
          Update password & log in
        </Button>
      </form>
    </AuthLayout>
  );
}
