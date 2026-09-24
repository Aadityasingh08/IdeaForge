import { useEffect } from 'react';
import { Logo } from '../components/ui/Logo';

const ROWS = [
  { name: 'if_session', type: 'Cookie · essential', purpose: 'Keeps you signed in. httpOnly (scripts can’t read it), Secure in production, SameSite protected.', duration: 'Until you close the browser, or 30 days with “Remember me”' },
  { name: 'ideaforge.owner', type: 'Local storage', purpose: 'Anonymous id so ideas started before signing up move into your account.', duration: 'Until cleared' },
  { name: 'ideaforge.pendingIdea', type: 'Session storage', purpose: 'Remembers an idea you typed while signing up.', duration: 'Until the tab closes' },
  { name: 'ideaforge.cookieNotice', type: 'Local storage', purpose: 'Remembers that you dismissed the cookie notice.', duration: 'Until cleared' },
];

export default function CookiePolicy() {
  useEffect(() => {
    document.title = 'Cookie policy · IdeaForge';
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white/85">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Cookie policy</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          IdeaForge uses the minimum needed to work. There are <strong className="text-ink">no analytics, tracking or advertising cookies</strong>, and nothing is shared with
          third parties. Because the only cookie is strictly necessary for signing in, it doesn’t require consent — but you should still know exactly what’s stored.
        </p>
        <div className="mt-8 space-y-3">
          {ROWS.map((r) => (
            <div key={r.name} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="rounded-lg bg-[#f1f5f9] px-2 py-0.5 text-sm font-semibold text-ink">{r.name}</code>
                <span className="text-xs font-semibold text-mint-dark">{r.type}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-body">{r.purpose}</p>
              <p className="mt-1 text-xs text-muted">Duration: {r.duration}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm leading-relaxed text-body">
          You can remove these at any time by logging out and clearing site data in your browser settings. Deleting your account from Account settings permanently removes your
          data from our servers.
        </p>
      </main>
    </div>
  );
}
