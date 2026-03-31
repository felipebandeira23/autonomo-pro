"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { updatePaymentStatus, useAppState, getEffectivePayment, addToast } from '@/lib/app-state';
import type { PaymentRecord, PaymentStatus } from '@/lib/mock-data';
import { getPaymentStatusMeta } from '@/lib/mock-data';
import { useEscapeToClose } from '@/lib/use-escape-to-close';

export default function PagamentoDetalheClient({
  payment,
}: {
  payment: PaymentRecord;
}) {
  const appState = useAppState();
  const effectivePayment = getEffectivePayment(payment, appState);
  const [copied, setCopied] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [formError, setFormError] = useState('');

  useEscapeToClose(isApproveModalOpen || isRejectModalOpen, () => {
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
  });

  const docStatus: PaymentStatus = effectivePayment.statusId;
  const statusMeta = useMemo(() => getPaymentStatusMeta(docStatus), [docStatus]);
  const pendingCalculations = docStatus === 'elaboracao';
  
  const paymentLogs = useMemo(() => {
    return appState.auditLogs.filter(log => log.targetId === effectivePayment.ident);
  }, [appState.auditLogs, effectivePayment.ident]);

  const openApproveModal = () => {
    if (appState.role === 'auditoria') {
      addToast('Acesso negado: Perfil Auditoria possui apenas leitura.', 'error');
      return;
    }
    setFormError('');
    setIsRejectModalOpen(false);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = () => {
    if (appState.role === 'auditoria') {
      addToast('Acesso negado: Perfil Auditoria possui apenas leitura.', 'error');
      return;
    }
    setFormError('');
    setRejectReason('');
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(true);
  };

  const confirmApproval = () => {
    updatePaymentStatus(effectivePayment.ident.replace('#', ''), 'pago');
    setIsApproveModalOpen(false);
    addToast('Lançamento aprovado com sucesso!', 'success');
  };

  const confirmRejection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rejectReason.trim()) {
      setFormError('Informe o motivo da rejeicao antes de confirmar.');
      return;
    }

    updatePaymentStatus(effectivePayment.ident.replace('#', ''), 'rejeitado');
    setIsRejectModalOpen(false);
    setRejectReason('');
    setFormError('');
    addToast('Lançamento rejeitado e movido para ajuste.', 'info');
  };

  const handleCopyUniversalId = async () => {
    await navigator.clipboard.writeText(effectivePayment.realid);
    setCopied(true);
    addToast('UUID copiado para area de transferencia.', 'success');
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in relative">

      {isApproveModalOpen && (
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Confirmar aprovacao e liquidacao
              </h3>
              <button
                onClick={() => setIsApproveModalOpen(false)}
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
            <p style={{ marginBottom: '24px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Esta acao aprova o lancamento <strong>{effectivePayment.ident}</strong> e marca a remessa como
              pronta para liquidacao financeira.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmApproval}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirmar aprovacao
              </button>
            </div>
          </div>
        </div>
      )}

      {isRejectModalOpen && (
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Motivo da Rejeicao
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
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
            <form onSubmit={confirmRejection}>
              <div style={{ marginBottom: '24px' }}>
                <textarea
                  required
                  value={rejectReason}
                  onChange={(event) => {
                    setRejectReason(event.target.value);
                    if (formError) {
                      setFormError('');
                    }
                  }}
                  placeholder="Descreva brevemente por que este fluxo de retencao/RPA nao e valido e retorne a competencia."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-surface)',
                    fontFamily: 'inherit',
                    resize: 'none',
                  }}
                />
                {formError && (
                  <p style={{ marginTop: '8px', color: 'var(--danger)', fontSize: '0.875rem' }}>{formError}</p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Confirmar rejeicao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/pagamentos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-main)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>&larr;</span> Retornar para Tabela
          </Link>
        </div>

        <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Dashboard Inicio
          </Link>
          <span style={{ margin: '0 8px' }}>&gt;</span>
          <Link
            href="/pagamentos"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
          >
            Pagamentos Mestra
          </Link>
          <span style={{ margin: '0 8px' }}>&gt;</span>
          <span style={{ color: 'var(--primary)' }}>{effectivePayment.ident}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h2
                style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}
              >
                Lancamento {effectivePayment.ident}
              </h2>
              <span
                style={{
                  background: statusMeta.style,
                  color: statusMeta.color,
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {statusMeta.detailBadge}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Gerado via API de Lotes Automaticos</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {docStatus === 'aprovacao' ? (
              <>
                <button
                  onClick={openRejectModal}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <span>❌</span> Rejeitar Lancamento
                </button>
                <button
                  onClick={openApproveModal}
                  style={{
                    background: 'var(--success)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span>✅</span> Aprovar e Liquidar
                </button>
              </>
            ) : (
              <button
                disabled
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-muted)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🔒</span> Trilha Fechada e Assinada
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>
              Dados Contratuais Pessoais
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Profissional Autonomo
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem' }}>{effectivePayment.nome}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CPF: {effectivePayment.cpf}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Centro de Custo / Convenio
                </div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.05rem' }}>
                  {effectivePayment.convenio}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🧮</span> Matematica Fiscal Aplicada
            </h3>
            <div
              style={{
                background: 'rgba(9, 30, 66, 0.02)',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '16px',
                }}
              >
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Valor Bruto Integrado</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{effectivePayment.bruto}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', color: 'var(--danger)' }}>
                <span style={{ fontWeight: 500 }}>(-) Retencao Calculada INSS (11%)</span>
                <span style={{ fontWeight: 600 }}>R$ {effectivePayment.deducaoinss}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '4px',
                  color: 'var(--danger)',
                  marginTop: '8px',
                }}
              >
                <span style={{ fontWeight: 500 }}>(-) Retencao Calculada IRRF / Deducoes Legais</span>
                <span style={{ fontWeight: 600 }}>R$ {effectivePayment.deducoirrf}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                  marginTop: '16px',
                }}
              >
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem' }}>
                  Montante Liquido Final Estimado
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.4rem' }}>{effectivePayment.liquido}</span>
              </div>
            </div>

            {pendingCalculations && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Calculos pendentes: este RPA ainda esta em elaboracao, por isso as retencoes podem aparecer zeradas.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Universal ID: {effectivePayment.realid.slice(0, 8)}...{effectivePayment.realid.slice(-8)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUniversalId}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <a
                href={`/api/payments/${effectivePayment.ident.replace('#', '')}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--primary-light)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
              >
                <span>📄</span> Baixar Espelho do Recibo (RPA)
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>
              Trilha de Auditoria Universal
            </h3>
            <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-light)' }}>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    border: '2px solid white',
                  }}
                />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Emissao da Ordem via CSV</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14/02/2026 - 14:00</div>
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    border: '2px solid white',
                  }}
                />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Aprovacao Tecnica</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  14/02/2026 - 15:30 (Joao Pedro Coordenacao)
                </div>
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background:
                      docStatus === 'pago'
                        ? 'var(--success)'
                        : docStatus === 'rejeitado'
                          ? 'var(--danger)'
                          : docStatus === 'aprovacao'
                            ? '#f59e0b'
                            : 'var(--border-light)',
                    border: '2px solid white',
                    boxShadow: docStatus === 'aprovacao' ? '0 0 0 4px rgba(245, 158, 11, 0.2)' : 'none',
                  }}
                />
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: docStatus === 'aprovacao' ? 'var(--primary)' : 'var(--text-main)',
                  }}
                >
                  Liberacao Financeira (Assinatura Diretoria)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {docStatus === 'aprovacao'
                    ? 'Travado aguardando aprovacao para liquidar.'
                    : docStatus === 'pago'
                      ? 'Assinado por Felipe Diretoria.'
                      : docStatus === 'rejeitado'
                        ? 'Rejeitado e devolvido com estorno.'
                        : 'Ainda em elaboracao, aguardando envio para aprovacao.'}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: docStatus === 'pago' ? 'var(--success)' : 'var(--border-light)',
                    border: '2px solid white',
                  }}
                />
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: docStatus === 'pago' ? 'var(--text-main)' : 'var(--text-muted)',
                  }}
                >
                  Remessa Bancaria SIG Liquidada
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {docStatus === 'pago' ? 'Liquidado imediatamente (API Bank Mock).' : '-- pendente aprovacao --'}
                </div>
              </div>
              
              {paymentLogs.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border-light)' }}>
                  {paymentLogs.map(log => (
                    <div key={log.id} style={{ position: 'relative', marginBottom: '24px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '-31px',
                          top: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'var(--text-main)',
                          border: '2px solid white',
                        }}
                      />
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {log.action} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({log.userRole.toUpperCase()})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleString('pt-BR')} - {log.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
