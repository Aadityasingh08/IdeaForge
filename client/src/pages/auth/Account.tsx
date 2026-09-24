import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useAuth } from '../../state/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input } from '../../components/ui/primitives';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { UserMenu, initials } from '../../components/UserMenu';
import { FormError, PasswordField, PasswordRules, passwordValid } from './AuthLayout';

function Section({ title, description, children, danger = false }: { title: string; description: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={`card grid gap-6 p-5 sm:p-7 md:grid-cols-[220px_minmax(0,1fr)] ${danger ? 'border-[#fecaca]' : ''}`}>
      <div>
        <h2 className={`text-base font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-body">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function Account() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    document.title = 'Account · IdeaForge';
  }, []);

  if (!user) return null;

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      setUser(await authApi.updateProfile(name.trim()));
      toast('Profile updated');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!current) return setPwError('Enter your current password.');
    if (!passwordValid(next)) return setPwError('Choose a password with at least 8 characters, including a letter and a number.');
    setSavingPw(true);
    setPwError(null);
    try {
      await authApi.changePassword(current, next);
      setCurrent('');
      setNext('');
      toast('Password changed — other devices were signed out');
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setSavingPw(false);
    }
  };

  const signOutEverywhere = async () => {
    await authApi.logoutAll().catch(() => undefined);
    setUser(null);
    navigate('/login');
  };

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await authApi.deleteAccount(deletePw);
      navigate('/'); // leave the private page before the session clears
      setUser(null);
    } catch (err) {
      setDeleteError((err as Error).message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo to="/projects" />
          <div className="flex items-center gap-2">
            <ButtonLink to="/projects" size="sm" variant="ghost">
              Your ideas
            </ButtonLink>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-mint to-ice text-lg font-bold text-white shadow-soft" aria-hidden>
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-ink sm:text-3xl">Account settings</h1>
            <p className="truncate text-sm text-body">
              {user.email} · member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <Section title="Profile" description="How your name appears in IdeaForge.">
          <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
            </div>
            <Button type="submit" variant="primary" loading={savingName} disabled={!name.trim() || name.trim() === user.name}>
              Save
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted">Email: {user.email}</p>
        </Section>

        <Section title="Password" description="Changing your password signs you out on every other device.">
          <form onSubmit={savePassword} noValidate className="space-y-4">
            <FormError message={pwError} />
            <PasswordField label="Current password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <div>
              <PasswordField label="New password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
              <PasswordRules value={next} />
            </div>
            <Button type="submit" variant="primary" loading={savingPw}>
              Change password
            </Button>
          </form>
        </Section>

        <Section title="Sessions" description="Your session is kept in a secure, httpOnly cookie that scripts can’t read.">
          <div className="flex flex-col gap-3 rounded-2xl bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-body">
              <ShieldCheck className="size-4 text-mint-dark" aria-hidden /> Lost a device or used a shared computer?
            </p>
            <Button onClick={signOutEverywhere} icon={<LogOut className="size-4" />}>
              Sign out everywhere
            </Button>
          </div>
        </Section>

        <Section title="Delete account" description="Permanently deletes your account, every project, its Brand DNA, versions and AI history." danger>
          <Button variant="danger" onClick={() => setDeleting(true)} icon={<Trash2 className="size-4" />}>
            Delete my account
          </Button>
        </Section>
      </main>

      <Modal open={deleting} onClose={() => setDeleting(false)} title="Delete your account?" description="This can’t be undone. All of your projects will be permanently removed." size="sm">
        <form onSubmit={deleteAccount} noValidate className="space-y-4">
          <FormError message={deleteError} />
          <PasswordField label="Confirm with your password" autoComplete="current-password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={deleteBusy} disabled={!deletePw}>
              Delete permanently
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

