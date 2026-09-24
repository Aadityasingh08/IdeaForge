const KEY = 'ideaforge.owner';
let memory: string | null = null;

/**
 * Anonymous id that keeps this browser's projects private from other visitors.
 * Stored in localStorage; falls back to memory when storage is unavailable.
 */
export function ownerId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    memory ??= crypto.randomUUID();
    return memory;
  }
}
