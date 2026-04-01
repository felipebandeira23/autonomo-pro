import React from 'react';

interface SkeletonCardProps {
  height?: number;
  lines?: number;
}

const pulseStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--border-light) 25%, rgba(203,213,225,0.4) 50%, var(--border-light) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  borderRadius: '6px',
};

/** Skeleton loader genérico para widgets do dashboard */
export function SkeletonCard({ height = 100, lines = 2 }: SkeletonCardProps) {
  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        className="glass-card"
        aria-busy="true"
        aria-label="Carregando dados..."
        role="status"
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div style={{ ...pulseStyle, height: '14px', width: '40%' }} />
        <div style={{ ...pulseStyle, height: String(height) + 'px', width: '70%' }} />
        {lines > 1 && (
          <div style={{ ...pulseStyle, height: '12px', width: '55%', marginTop: '4px' }} />
        )}
      </div>
    </>
  );
}

/** Skeleton para linha de tabela */
export function SkeletonRow() {
  return (
    <tr>
      {[60, 30, 25, 20].map((w, i) => (
        <td key={i} style={{ padding: '14px 0' }}>
          <div style={{ ...pulseStyle, height: '14px', width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}
