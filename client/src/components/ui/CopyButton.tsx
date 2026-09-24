import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from './Toast';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Reusable copy-to-clipboard control with inline "Copied" feedback and a toast. */
export function CopyButton({ text, label = 'Copy', showLabel = false, className = '' }: { text: string; label?: string; showLabel?: boolean; className?: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const onClick = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      toast('Copied to clipboard');
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast('Couldn’t copy — select the text instead', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
        copied ? 'text-mint-dark' : 'text-muted hover:bg-[#eef6f7] hover:text-ink'
      } ${className}`}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {showLabel && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}

export { copyText };
