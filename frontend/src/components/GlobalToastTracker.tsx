"use client";

import { useAppState } from '@/lib/app-state';

export default function GlobalToastTracker() {
  const { toasts } = useAppState();

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 99999 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-in"
          style={{
            background: t.type === 'error' ? 'var(--danger)' : t.type === 'success' ? 'var(--success)' : 'var(--bg-sidebar)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '250px',
          }}
        >
          {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.message}
        </div>
      ))}
    </div>
  );
}
