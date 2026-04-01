import React from 'react';
import type { PaymentStatus } from '@/lib/mock-data';

type BadgeVariant = 'pago' | 'aprovacao' | 'elaboracao' | 'rejeitado' | 'sincronizado' | 'atrasado' | 'analise';

const BADGE_CONFIG: Record<BadgeVariant, { label: string; icon: string; bg: string; color: string; border: string }> = {
  pago: {
    label: 'Processado',
    icon: '✓',
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#065f46',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  sincronizado: {
    label: 'Sincronizado',
    icon: '✓',
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#065f46',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  aprovacao: {
    label: 'Em Análise',
    icon: '⏳',
    bg: 'rgba(245, 158, 11, 0.1)',
    color: '#92400e',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  analise: {
    label: 'Em Análise',
    icon: '⏳',
    bg: 'rgba(245, 158, 11, 0.1)',
    color: '#92400e',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  elaboracao: {
    label: 'Em Elaboração',
    icon: '✏',
    bg: 'rgba(100, 116, 139, 0.1)',
    color: '#334155',
    border: 'rgba(100, 116, 139, 0.25)',
  },
  rejeitado: {
    label: 'Rejeitado',
    icon: '✕',
    bg: 'rgba(239, 68, 68, 0.1)',
    color: '#991b1b',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  atrasado: {
    label: 'Atrasado',
    icon: '!',
    bg: 'rgba(239, 68, 68, 0.1)',
    color: '#991b1b',
    border: 'rgba(239, 68, 68, 0.3)',
  },
};

interface StatusBadgeProps {
  status: BadgeVariant | PaymentStatus | string;
  /** Override do label visível */
  label?: string;
}

/**
 * Badge semântico acessível com ícone + texto.
 * Nunca depende apenas de cor — sempre inclui texto descritivo.
 */
export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = BADGE_CONFIG[status as BadgeVariant] ?? {
    label: label ?? status,
    icon: '●',
    bg: 'rgba(100, 116, 139, 0.1)',
    color: '#475569',
    border: 'rgba(100, 116, 139, 0.25)',
  };

  const displayLabel = label ?? config.label;

  return (
    <span
      role="status"
      aria-label={displayLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '0.65rem', lineHeight: 1 }}>
        {config.icon}
      </span>
      {displayLabel}
    </span>
  );
}
