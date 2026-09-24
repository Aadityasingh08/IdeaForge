import { useId, useState, type ReactNode } from 'react';
import { Check, Pencil, RefreshCw, Swords, X } from 'lucide-react';
import { Sparkle } from '../ui/Logo';
import { Badge } from '../ui/primitives';
import { Button, IconButton } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';

/** A single AI finding: small icon, title, content (text or bullet list). */
export function AIInsightCard({
  icon,
  title,
  children,
  items,
  accent = false,
  action,
  className = '',
  delay = 0,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  items?: string[];
  accent?: boolean;
  action?: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`card group animate-slide-up p-5 transition-shadow hover:shadow-lift sm:p-6 ${accent ? 'border-[#99f6e4] bg-gradient-to-br from-white to-mint-50/60' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-mint-50 text-mint-dark ring-1 ring-[#ccfbf1]" aria-hidden>
            {icon}
          </span>
          <h3 className="eyebrow !text-[11.5px] !text-ink">{title}</h3>
        </div>
        {action}
      </header>
      {children && <div className="text-[15px] leading-relaxed text-body">{children}</div>}
      {items && (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it} className="flex gap-2.5 text-[15px] leading-relaxed text-body">
              <Sparkle className="mt-[5px] size-3 shrink-0" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** "Why this?" — expands the AI's reasoning for a decision, inline and accessible. */
export function WhyThis({ question, answer, className = '' }: { question: string; answer: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-mint-dark transition-colors hover:bg-mint-50"
      >
        <Sparkle className="size-3" />
        Why this?
      </button>
      {open && (
        <div id={id} className="mt-2 animate-slide-up rounded-xl border border-[#ccfbf1] bg-mint-50/60 p-3.5">
          <p className="text-[13px] font-semibold text-ink">{question}</p>
          <div className="mt-1 text-[13px] leading-relaxed text-body">{answer}</div>
        </div>
      )}
    </div>
  );
}

/** Transparent AI reasoning block shown under major decisions. */
export function AIReasoning({ title = 'AI reasoning', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#99f6e4] bg-white/70 p-4 sm:p-5">
      <p className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-mint-dark">
        <Sparkle className="size-3.5" /> {title}
      </p>
      <div className="text-sm leading-relaxed text-body">{children}</div>
    </div>
  );
}

type FieldValue = string | string[];

/**
 * Inline-editable value. Edits are saved to BrandDNA and become the source of truth.
 * Lists are edited one item per line.
 */
export function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  display,
  edited,
  copy = false,
  editing: controlled,
  onEditingChange,
  hideEditButton = false,
  saving,
}: {
  label: string;
  value: FieldValue;
  onSave: (v: FieldValue) => Promise<unknown> | void;
  multiline?: boolean;
  display?: ReactNode;
  edited?: boolean;
  copy?: boolean;
  editing?: boolean;
  onEditingChange?: (e: boolean) => void;
  hideEditButton?: boolean;
  saving?: boolean;
}) {
  const isList = Array.isArray(value);
  const [internal, setInternal] = useState(false);
  const editing = controlled ?? internal;
  const setEditing = (e: boolean) => (onEditingChange ? onEditingChange(e) : setInternal(e));
  const initial = () => (isList ? (value as string[]).join('\n') : (value as string));
  const [draft, setDraft] = useState(editing ? initial : '');
  const fieldId = useId();

  // Seed the draft whenever editing starts — including when a parent opens the editor.
  const [wasEditing, setWasEditing] = useState(editing);
  if (editing !== wasEditing) {
    setWasEditing(editing);
    if (editing) setDraft(initial());
  }

  const save = async () => {
    const next = isList ? draft.split('\n').map((s) => s.trim()).filter(Boolean) : draft.trim();
    if (!isList && !next) return;
    await onSave(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="animate-fade-in">
        <label htmlFor={fieldId} className="sr-only">
          {label}
        </label>
        <textarea
          id={fieldId}
          autoFocus
          value={draft}
          rows={isList ? Math.max(3, draft.split('\n').length) : multiline ? 3 : 2}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditing(false);
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
          }}
          className="w-full resize-y rounded-xl border border-mint bg-white px-3.5 py-2.5 text-[15px] leading-relaxed text-ink shadow-soft focus:outline-none focus:ring-4 focus:ring-[rgb(20_184_166/0.12)]"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" onClick={save} loading={saving} icon={<Check className="size-3.5" />}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} icon={<X className="size-3.5" />}>
            Cancel
          </Button>
          {isList && <span className="text-xs text-muted">One item per line</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="group/field relative">
      <div className="pr-16">{display ?? (isList ? (value as string[]).join(', ') : (value as string))}</div>
      <div className="absolute right-0 top-0 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/field:opacity-100 sm:focus-within:opacity-100">
        {copy && !isList && <CopyButton text={value as string} label={`Copy ${label.toLowerCase()}`} />}
        {!hideEditButton && (
          <IconButton size="sm" label={`Edit ${label.toLowerCase()}`} onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </IconButton>
        )}
      </div>
      {edited && (
        <Badge tone="ice" className="mt-2">
          <Pencil className="size-2.5" aria-hidden /> Edited by you
        </Badge>
      )}
    </div>
  );
}

/** The user-control bar for important decisions: Accept · Edit · Regenerate · Challenge. */
export function DecisionBar({
  accepted,
  onAccept,
  onEdit,
  onRegenerate,
  onChallenge,
  regenerating,
  disabled,
}: {
  accepted?: boolean;
  onAccept?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onChallenge?: () => void;
  regenerating?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onAccept &&
        (accepted ? (
          <Badge tone="success" className="!py-1.5 !px-3 !text-xs">
            <Check className="size-3.5" aria-hidden /> Accepted
          </Badge>
        ) : (
          <Button size="sm" variant="mint" onClick={onAccept} disabled={disabled} icon={<Check className="size-3.5" />}>
            Looks good
          </Button>
        ))}
      {onEdit && (
        <Button size="sm" onClick={onEdit} disabled={disabled} icon={<Pencil className="size-3.5" />}>
          Edit
        </Button>
      )}
      {onRegenerate && (
        <Button size="sm" onClick={onRegenerate} loading={regenerating} disabled={disabled} icon={<RefreshCw className="size-3.5" />}>
          Regenerate
        </Button>
      )}
      {onChallenge && (
        <Button size="sm" variant="ghost" onClick={onChallenge} disabled={disabled} icon={<Swords className="size-3.5" />}>
          Challenge this
        </Button>
      )}
    </div>
  );
}
