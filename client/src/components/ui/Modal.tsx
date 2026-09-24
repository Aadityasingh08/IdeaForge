import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';

/** Accessible dialog: focus is trapped, Escape closes, focus returns to the trigger. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])') ?? []).filter(
        (el) => !el.hasAttribute('disabled'),
      );
    const first = focusables().find((el) => el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') ?? focusables()[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const els = focusables();
        if (!els.length) return;
        const [a, b] = [els[0], els[els.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;
  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-[rgb(15_23_42/0.32)] backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative max-h-[92vh] w-full ${width} animate-scale-in overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl sm:p-7`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-ink">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm leading-relaxed text-body">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={onClose} className="-mr-2 -mt-1">
            <X className="size-4" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
