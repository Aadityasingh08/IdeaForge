import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, Info } from 'lucide-react';

type Tone = 'success' | 'info' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastCtx = createContext<(message: string, tone?: Tone) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-slide-up items-center gap-2.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lift"
          >
            {t.tone === 'success' && <Check className="size-4 text-mint-light" aria-hidden />}
            {t.tone === 'info' && <Info className="size-4 text-aqua" aria-hidden />}
            {t.tone === 'error' && <AlertTriangle className="size-4 text-warning" aria-hidden />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
