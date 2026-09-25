import { useEffect, useState } from 'react';

export function ConfettiBlast({ trigger = true }: { trigger?: boolean }) {
  const [active, setActive] = useState(trigger);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const timer = setTimeout(() => setActive(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!active) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage
    delay: Math.random() * 1.5, // seconds
    duration: 2 + Math.random() * 2, // seconds
    size: 6 + Math.random() * 8, // px
    color: ['#0f766e', '#14b8a6', '#06b6d4', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'][i % 7],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {confettiPieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-xs animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
