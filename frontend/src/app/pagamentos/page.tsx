"use client";

import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { getEffectivePayments, useAppState } from '@/lib/app-state';
import { useEscapeToClose } from '@/lib/use-escape-to-close';
import { getPaymentStatusMeta } from '@/lib/mock-data';

const tabs = [
  { id: 'todos', label: 'Todos Lancamentos' },
  { id: 'elaboracao', label: 'Em Elaboracao' },
  { id: 'aprovacao', label: 'Em Aprovacao' },
  { id: 'pagos', label: 'Pagos / Liberados' },
] as const;

export default function Pagamentos() {
  const appState = useAppState();
  const effectivePayments = getEffectivePayments(appState);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('todos');
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEscapeToClose(Boolean(modalContent), () => setModalContent(null));

  const triggerSearchFeedback = () => {
    setIsSearching(true);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => setIsSearching(false), 400);
  };

  const filtered = effectivePayments.filter((payment) => {
    const matchSearch =
      payment.nome.toLowerCase().includes(search.toLowerCase()) ||
      payment.ident.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) {
      return false;
    }

    if (tab === 'elaboracao') {
      return payment.statusId === 'elaboracao';
    }

    if (tab === 'aprovacao') {
      return payment.statusId === 'aprovacao';
    }

    if (tab === 'pagos') {
      return payment.statusId === 'pago';
    }

    return true;
  });

  const countElaboracao = effectivePayments.filter((payment) => payment.statusId === 'elaboracao').length;
  const countAprovacao = effectivePayments.filter((payment) => payment.statusId === 'aprovacao').length;

  return (
    <div className="animate-fade-in relative">
      {modalContent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9,30,66,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              background: 'var(--bg-body)',
              padding: '32px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
              <button
                onClick={() => setModalContent(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                &times;
              </button>
            </div>
            {modalContent === 'Lancar Lote via Excel' ? (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                  Arquivo Lote RPA (.xlsx / .csv)
                </label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px dashed var(--border-light)',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
                Nenhum contrato ativo pendente de aprovacao previa da auditoria nesta competencia.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setModalContent(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Voltar
              </button>
              <button
                onClick={() => setModalContent(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Avancar Operacao
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Esteira de Pagamentos
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Fluxo de aprovacao em camadas, retencao automatica da fonte e RPAs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setModalContent('Contratos Globais Ativos')}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <span>⚙️</span> Contratos / Projetos
          </button>
          <button
            onClick={() => setModalContent('Lancar Lote via Excel')}
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span>+</span> Lancar Lote
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
        {tabs.map((tabItem) => {
          const isActive = tab === tabItem.id;
          const count =
            tabItem.id === 'elaboracao' ? countElaboracao : tabItem.id === 'aprovacao' ? countAprovacao : null;

          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => {
                setTab(tabItem.id);
                triggerSearchFeedback();
              }}
              aria-pressed={isActive}
              style={{
                paddingBottom: '12px',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                background: 'transparent',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{tabItem.label}</span>
              {count !== null && (
                <span
                  style={{
                    background: tabItem.id === 'aprovacao' ? '#f59e0b' : 'var(--border-light)',
                    color: tabItem.id === 'aprovacao' ? 'white' : 'var(--text-main)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              triggerSearchFeedback();
            }}
            placeholder="Buscar por favorecido, CPF ou codigo..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          {isSearching && (
            <div style={{ position: 'absolute', right: '16px', top: '10px', fontSize: '1.2rem', animation: 'spin 1s linear infinite' }}>
              ⏳
            </div>
          )}
        </div>
        <select
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            background: 'white',
            fontSize: '0.875rem',
            minWidth: '150px',
          }}
        >
          <option>Ref: Fevereiro/2026</option>
        </select>
        <select
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            background: 'white',
            fontSize: '0.875rem',
            minWidth: '150px',
          }}
        >
          <option>Todas Unidades</option>
        </select>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            minWidth: '980px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            opacity: isSearching ? 0.3 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <thead>
            <tr style={{ background: 'rgba(9, 30, 66, 0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>
                Identificador
              </th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>
                Favorecido / Convenio
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textAlign: 'right',
                }}
              >
                Valor Bruto
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textAlign: 'right',
                }}
              >
                Deducoes (IR/INSS)
              </th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>
                Status / Camada
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textAlign: 'right',
                }}
              >
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => {
              const statusMeta = getPaymentStatusMeta(payment.statusId);

              return (
                <tr key={payment.id} className="hover-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--primary)' }}>{payment.ident}</td>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{payment.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Convenio: {payment.convenio}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', color: 'var(--text-main)', fontWeight: 600, textAlign: 'right' }}>
                    {payment.bruto}
                  </td>
                  <td style={{ padding: '18px 24px', color: 'var(--danger)', fontWeight: 600, textAlign: 'right' }}>
                    {payment.descontos}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span
                      style={{
                        background: statusMeta.style,
                        color: statusMeta.color,
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {statusMeta.badge}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <Link href={`/pagamentos/${payment.ident.replace('#', '')}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      Analisar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
