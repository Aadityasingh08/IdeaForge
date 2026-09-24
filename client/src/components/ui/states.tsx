import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react';
import { Sparkle } from './Logo';
import { Button } from './Button';
import { LOADING_MESSAGES } from '../../lib/stages';
import { NetworkError } from '../../lib/api';

/** AI processing state: animated sparkle + stage-specific progress messages. */
export function LoadingState({ op, title, compact = false }: { op: string; title?: string; compact?: boolean }) {
  const messages = LOADING_MESSAGES[op] ?? ['Thinking…'];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, messages.length - 1)), 1700);
    return () => clearInterval(t);
  }, [op, messages.length]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#ccfbf1] bg-mint-50/70 px-4 py-3" role="status" aria-live="polite">
        <Sparkle className="size-5" animated />
        <span className="text-sm font-medium text-mint-dark">{messages[step]}</span>
      </div>
    );
  }

  return (
    <div className="card relative animate-fade-in overflow-hidden px-6 py-10 sm:px-10 sm:py-14" role="status" aria-live="polite">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative mb-6 grid size-16 place-items-center">
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.35),transparent_70%)] blur-md" aria-hidden />
          <Sparkle className="relative size-11" animated />
        </div>
        {title && <p className="mb-1 text-lg font-semibold tracking-tight text-ink">{title}</p>}
        <p key={step} className="animate-slide-up text-[15px] font-medium text-mint-dark">
          {messages[step]}
        </p>
        <ol className="mt-6 w-full space-y-2 text-left" aria-label="Progress">
          {messages.map((m, i) => (
            <li key={m} className={`flex items-center gap-2.5 text-[13px] transition-colors ${i <= step ? 'text-body' : 'text-[#cbd5e1]'}`}>
              <span
                className={`grid size-4 place-items-center rounded-full transition-colors ${
                  i < step ? 'bg-mint text-white' : i === step ? 'bg-mint-light' : 'bg-[#f1f5f9]'
                }`}
                aria-hidden
              >
                {i < step && (
                  <svg viewBox="0 0 12 12" className="size-2.5">
                    <path d="M2.5 6.2 5 8.5 9.5 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {m.replace('…', '')}
            </li>
          ))}
        </ol>
        <div className="mt-8 grid w-full gap-2" aria-hidden>
          <div className="skeleton h-3 w-11/12" />
          <div className="skeleton h-3 w-8/12" />
        </div>
      </div>
    </div>
  );
}

/** Friendly, actionable AI error. Previously generated work is always kept. */
export function ErrorState({
  error,
  title,
  onRetry,
  onContinue,
  continueLabel = 'Continue with existing information',
  retrying,
}: {
  error: Error;
  title?: string;
  onRetry?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  retrying?: boolean;
}) {
  const offline = error instanceof NetworkError;
  return (
    <div className="card animate-slide-up border-[#fde68a] bg-[#fffdf7] p-5 sm:p-6" role="alert">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fef3c7] text-[#b45309]">
          {offline ? <WifiOff className="size-5" aria-hidden /> : <AlertTriangle className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{offline ? 'Can’t connect to IdeaForge right now.' : title ?? 'AI couldn’t complete this step.'}</p>
          <p className="mt-1 text-sm leading-relaxed text-body">{offline ? 'Check that the server is running, then try again.' : error.message}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-mint-dark">
            <ShieldCheck className="size-3.5" aria-hidden /> Your previous work is safe.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {onRetry && (
              <Button variant="primary" size="sm" onClick={onRetry} loading={retrying} icon={<RefreshCw className="size-3.5" />}>
                {offline ? 'Retry connection' : 'Retry'}
              </Button>
            )}
            {onContinue && (
              <Button variant="secondary" size="sm" onClick={onContinue}>
                {continueLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card relative animate-fade-in overflow-hidden px-6 py-14 text-center sm:py-16">
      <div className="hero-gradient pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-white shadow-glow">{icon ?? <Sparkle className="size-8" />}</div>
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-body">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
