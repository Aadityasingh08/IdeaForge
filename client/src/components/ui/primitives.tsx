import { forwardRef, useId, useState, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

type BadgeTone = 'mint' | 'neutral' | 'success' | 'warning' | 'danger' | 'ice' | 'dark';
const BADGE: Record<BadgeTone, string> = {
  mint: 'bg-mint-50 text-mint-dark ring-[#99f6e4]',
  neutral: 'bg-[#f1f5f9] text-body ring-line',
  success: 'bg-[#ecfdf5] text-[#047857] ring-[#a7f3d0]',
  warning: 'bg-[#fffbeb] text-[#b45309] ring-[#fde68a]',
  danger: 'bg-[#fef2f2] text-[#b91c1c] ring-[#fecaca]',
  ice: 'bg-[#eff6ff] text-[#1d4ed8] ring-[#bfdbfe]',
  dark: 'bg-ink text-white ring-ink',
};

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${BADGE[tone]} ${className}`}>
      {children}
    </span>
  );
}

const fieldBase =
  'w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-muted shadow-soft transition focus:border-mint focus:outline-none focus:ring-4 focus:ring-[rgb(20_184_166/0.12)]';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input(
  { label, hint, error, hideLabel, className = '', id, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-ink'}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
        className={`${fieldBase} h-11 ${error ? 'border-danger' : ''} ${className}`}
        {...rest}
      />
      {(error || hint) && (
        <p id={`${fieldId}-msg`} className={`mt-1.5 text-[13px] ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea(
  { label, hint, error, hideLabel, className = '', id, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-ink'}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
        className={`${fieldBase} resize-y py-3 leading-relaxed ${error ? 'border-danger' : ''} ${className}`}
        {...rest}
      />
      {(error || hint) && (
        <p id={`${fieldId}-msg`} className={`mt-1.5 text-[13px] ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

/** Accessible tooltip: shows on hover and keyboard focus, described via aria-describedby. */
export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 animate-fade-in rounded-lg bg-ink px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-lift ${
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2 text-mint-dark">{eyebrow}</p>}
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-body">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
