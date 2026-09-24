import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Logo, Sparkle } from '../../components/ui/Logo';

/** Split layout for account pages: brand panel on the left, form on the right. */
export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between" aria-hidden>
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.35),transparent_65%)]" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-[radial-gradient(circle,rgb(20_184_166/0.35),transparent_65%)]" />
        <div className="relative flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white/10">
            <Sparkle className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">IdeaForge</span>
        </div>
        <div className="relative max-w-md">
          <Sparkle className="mb-8 size-16" />
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Turn your idea into a <span className="text-gradient">brand.</span>
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[#cbd5e1]">
            An AI strategist that understands your idea, challenges generic decisions and hands you a launch-ready brand system.
          </p>
        </div>
        <ul className="relative space-y-2 text-sm text-[#cbd5e1]">
          {['Understand → Strategy → Challenge → Visual → Brand Kit', 'Your projects are private to your account', 'Download as Markdown, JSON or a PDF brand book'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Sparkle className="size-3" /> {t}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-body">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-body">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({ label, error, hint, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`h-11 w-full rounded-xl border bg-white pl-3.5 pr-11 text-[15px] text-ink shadow-soft transition focus:border-mint focus:outline-none focus:ring-4 focus:ring-[rgb(20_184_166/0.12)] ${
            error ? 'border-danger' : 'border-line'
          }`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-[#eef6f7] hover:text-ink"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={`mt-1.5 text-[13px] ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

/** Live checklist for the password rules the server enforces. */
export function PasswordRules({ value }: { value: string }) {
  const rules = [
    { ok: value.length >= 8, label: 'At least 8 characters' },
    { ok: /[a-z]/i.test(value), label: 'A letter' },
    { ok: /\d/.test(value), label: 'A number' },
  ];
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Password requirements">
      {rules.map((r) => (
        <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-mint-dark' : 'text-muted'}`}>
          <span className={`size-1.5 rounded-full ${r.ok ? 'bg-mint' : 'bg-[#cbd5e1]'}`} aria-hidden />
          {r.label}
          <span className="sr-only">{r.ok ? '(met)' : '(not met)'}</span>
        </li>
      ))}
    </ul>
  );
}

export const passwordValid = (p: string) => p.length >= 8 && /[a-z]/i.test(p) && /\d/.test(p);

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-sm text-[#b91c1c]">
      {message}
    </p>
  );
}
