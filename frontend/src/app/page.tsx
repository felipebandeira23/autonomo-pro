"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDerivedTenantMetrics, getEffectivePayments, useAppState } from '@/lib/app-state';
import { tenantSummaries, type TenantKey } from '@/lib/mock-data';
import { useEscapeToClose } from '@/lib/use-escape-to-close';

function DashboardContent() {
  const appState = useAppState();
  const effectivePayments = getEffectivePayments(appState);
  const metrics = getDerivedTenantMetrics(appState);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantParam = (searchParams.get('tenant') as TenantKey | null) || 'corp';
  const tenant = tenantSummaries[tenantParam] ? tenantParam : 'corp';
  const data = tenantSummaries[tenant];

  const [modalContent, setModalContent] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');
  const [newAutonomo, setNewAutonomo] = useState({ nome: '', cpf: '' });
  useEscapeToClose(Boolean(modalContent), () => setModalContent(null));

  const showTemporaryToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const handleExport = () => {
    const csvRows = [
      'Profissional,Data,Bruto,Status',
      ...effectivePayments.map((payment) => `${payment.nome},13/02/2026,${payment.bruto},${payment.statusId}`),
    ];
    const csvContent = `data:text/csv;charset=utf-8,${csvRows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_retencoes_${tenant}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showTemporaryToast('Relatorio CSV gerado com sucesso.');
  };

  const handleCreateAutonomo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newAutonomo.nome.trim() || !newAutonomo.cpf.trim()) {
      setFormError('Preencha nome e CPF antes de salvar.');
      return;
    }

    setModalContent(null);
    setNewAutonomo({ nome: '', cpf: '' });
    setFormError('');
    showTemporaryToast('Ficha de autonomo criada no mock.');
  };

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

            {modalContent === 'Processamento em Lote' ? (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                    Selecione o arquivo Excel ou CSV
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
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setModalContent(null);
                      showTemporaryToast('Upload em desenvolvimento. Nenhum arquivo foi processado.');
                    }}
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
                    Salvar Operacao
                  </button>
                </div>
              </>
            ) : modalContent === 'Criar Ficha de Autonomo' ? (
              <form onSubmit={handleCreateAutonomo}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <input
                    required
                    type="text"
                    value={newAutonomo.nome}
                    onChange={(event) => {
                      setNewAutonomo((current) => ({ ...current, nome: event.target.value }));
                      if (formError) {
                        setFormError('');
                      }
                    }}
                    placeholder="Nome Completo"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-surface)',
                    }}
                  />
                  <input
                    required
                    type="text"
                    value={newAutonomo.cpf}
                    onChange={(event) => {
                      setNewAutonomo((current) => ({ ...current, cpf: event.target.value }));
                      if (formError) {
                        setFormError('');
                      }
                    }}
                    placeholder="CPF"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-surface)',
                    }}
                  />
                  {formError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{formError}</p>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
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
                    Cancelar
                  </button>
                  <button
                    type="submit"
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
                    Salvar Operacao
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Interface de contexto carregada remotamente.</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--success)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-md)',
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Visao Executiva {tenant !== 'corp' ? `- ${tenant.toUpperCase()}` : ''}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Resumo das retencoes consolidadas no periodo.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              fontWeight: 600,
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option>Ref: Fevereiro/2026</option>
            <option>Ref: Janeiro/2026</option>
            <option>Ref: Dezembro/2025</option>
          </select>
          <button
            onClick={handleExport}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📥</span> Exportar Relatorio
          </button>
        </div>
      </div>

      {metrics.totalCriticalAlerts > 0 && (
        <div
          className="glass-card"
          style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)',
          }}
        >
          <div>
            <div style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '4px' }}>Alertas Operacionais</div>
            <div style={{ color: 'var(--text-main)' }}>
              UFRJ possui <strong>{metrics.ufrjPendingGuides} guias</strong> pendentes de tratamento.
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/tenants')}
            style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Ver detalhes
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Autonomos Ativos
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>{data.ativos}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '8px' }}>+12 neste mes</div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Valor Bruto Repassado
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>{data.repasses}</div>
        </div>
        <div className="glass-card" style={{ position: 'relative' }}>
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Impostos Retidos
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--border-light)',
                color: 'var(--text-muted)',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                cursor: 'help',
                border: 'none',
                padding: 0,
              }}
              aria-label="Explicacao de impostos retidos"
            >
              ?
              {showTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '150%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px',
                    background: 'var(--text-main)',
                    color: 'white',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    width: '220px',
                    zIndex: 10,
                    textAlign: 'left',
                    pointerEvents: 'none',
                    boxShadow: 'var(--shadow-md)',
                    lineHeight: '1.4',
                  }}
                >
                  Soma das retencoes de INSS e IRRF processadas antes da liquidacao final do repasse.
                </div>
              )}
            </button>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)', marginTop: '8px' }}>{data.retidos}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Historico da Planilha Mestra</h3>
            <button
              onClick={() => router.push('/pagamentos')}
              style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              Ver Todos Lancamentos &rarr;
            </button>
          </div>
          <div style={{ padding: '0 24px 24px 24px', overflowX: 'auto', width: '100%' }}>
            <table style={{ minWidth: '600px', width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Profissional</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Data</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Bruto</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Status API</th>
                </tr>
              </thead>
              <tbody>
                {effectivePayments.slice(0, 2).map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 0', fontWeight: 500, color: 'var(--text-main)' }}>{payment.nome}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>13/02/2026</td>
                    <td style={{ padding: '16px 0', fontWeight: 600 }}>{payment.bruto}</td>
                    <td style={{ padding: '16px 0' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          background: payment.statusId === 'pago' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: payment.statusId === 'pago' ? 'var(--success)' : '#d97706',
                          fontWeight: 600,
                        }}
                      >
                        {payment.statusId === 'pago' ? 'Sync Concluido' : 'Em Analise'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0 24px 16px 24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Preview de 2 de {effectivePayments.length} registros.
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-main)' }}>Rotinas Sistemicas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setModalContent('Criar Ficha de Autonomo')}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 600,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>➕</span> Criar Ficha de Autonomo
            </button>
            <button
              onClick={() => setModalContent('Processamento em Lote')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 600,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>📑</span> Processamento em Lote (Excel)
            </button>
            <button
              onClick={() => router.push('/configuracoes')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 600,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                cursor: 'pointer',
              }}
            >
              <span>⚙️</span> Editar Tabela da SRF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Carregando Visualizacao Corporativa...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
