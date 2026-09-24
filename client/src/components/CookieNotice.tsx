import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { Button } from './ui/Button';

const KEY = 'ideaforge.cookieNotice';

const dismissed = () => {
  try {
    return localStorage.getItem(KEY) === 'ok';
  } catch {
    return false;
  }
};

/**
 * IdeaForge only uses a strictly necessary session cookie, so no consent is required —
 * this notice informs people and links to the full cookie policy.
 */
export function CookieNotice() {
  const [hidden, setHidden] = useState(dismissed);
  if (hidden) return null;

  const close = () => {
    try {
      localStorage.setItem(KEY, 'ok');
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-[65] mx-auto max-w-xl animate-slide-up sm:bottom-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-lift sm:flex-row sm:items-center">
        <span className="hidden size-9 shrink-0 place-items-center rounded-xl bg-mint-50 text-mint-dark sm:grid" aria-hidden>
          <Cookie className="size-4" />
        </span>
        <p className="flex-1 text-[13px] leading-relaxed text-body">
          We use one essential cookie to keep you signed in — no tracking or advertising cookies.{' '}
          <Link to="/cookies" className="font-semibold text-mint-dark hover:underline">
            Cookie policy
          </Link>
        </p>
        <Button size="sm" variant="primary" onClick={close}>
          Got it
        </Button>
      </div>
    </div>
  );
}
