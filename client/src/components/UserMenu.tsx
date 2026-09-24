import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';

/** Avatar with a dropdown: projects, account settings and log out. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const signOut = async () => {
    setOpen(false);
    // Leave the private page first, so the login guard doesn't redirect to /login.
    navigate('/');
    await logout();
  };

  const item = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-body hover:bg-[#f1f7f8] hover:text-ink';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mint to-ice text-xs font-bold text-white ring-2 ring-white transition-transform hover:scale-105"
      >
        {initials(user.name)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 animate-scale-in rounded-2xl border border-line bg-white p-1.5 shadow-lift">
          <div className="border-b border-line px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="pt-1.5">
            <Link role="menuitem" to="/projects" onClick={() => setOpen(false)} className={item}>
              <FolderOpen className="size-4" aria-hidden /> Your ideas
            </Link>
            <Link role="menuitem" to="/account" onClick={() => setOpen(false)} className={item}>
              <Settings className="size-4" aria-hidden /> Account settings
            </Link>
            <button role="menuitem" type="button" onClick={signOut} className={`${item} hover:!text-danger`}>
              <LogOut className="size-4" aria-hidden /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
