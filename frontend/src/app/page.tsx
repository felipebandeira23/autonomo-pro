"use client";

import React, { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getDashboardMetrics,
  getEffectivePayments,
  useAppState,
  addAuditLog,
  setDashboardReferencia,
  formatSafeCurrency,
} from '@/lib/app-state';
import { useEscapeToClose } from '@/lib/use-escape-to-close';
import { StatusBadge } from '@/components/StatusBadge';
import { SkeletonCard, SkeletonRow } from '@/components/SkeletonCard';

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
const REFERENCIAS = [
  { value: '2026-02', label: 'Fevereiro/2026' },
  { value: '2026-01', label: 'Janeiro/2026' },
  { value: '2025-12', label: 'Dezembro/2025' },
];

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatRefLabel(ref: string) {
  return REFERENCIAS.find((r) => r.value === ref)?.label ?? ref;
}

// ───────────────────────────────────────────────────────────
// Sub-component: KPI Card
// ───────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  delta?: { value: number; suffix: string; tooltip: string };
  tooltip?: string;
  color?: string;
  loading?: boolean;
}
function KpiCard({ label, value, delta, tooltip, color = 'var(--text-main)', loading }: KpiCardProps) {
  const [showTip, setShowTip] = useState(false);
  if (loading) return <SkeletonCard height={56} lines={2} />;
  return (
    <div className="glass-card" style={{ position: 'relative' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div
        style={{ 
          fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', 
          fontWeight: 700, 
          color, 
          marginTop: '10px', 
          cursor: tooltip ? 'help' : 'default',
          wordBreak: 'break-word',
          lineHeight: '1.2'
        }}
        onMouseEnter={() => tooltip && setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        aria-describedby={tooltip ? `tip-${label}` : undefined}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div style={{ fontSize: '0.8rem', color: delta.value === 0 ? 'var(--text-muted)' : delta.value > 0 ? 'var(--success)' : 'var(--danger)', marginTop: '8px', fontWeight: 600 }}>
          {delta.value === 0 ? '=' : delta.value > 0 ? `▲ +${delta.value}` : `▼ ${delta.value}`} {delta.suffix}
        </div>
      )}
      {tooltip && showTip && (
        <div
          id={`tip-${label}`}
          role="tooltip"
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            padding: '10px 14px', background: '#1e293b', color: 'white', fontSize: '0.75rem',
            borderRadius: '8px', width: '240px', zIndex: 20, boxShadow: 'var(--shadow-md)',
            lineHeight: 1.5, fontWeight: 400, pointerEvents: 'none', marginTop: '6px',
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Sub-component: Alert Banner
// ───────────────────────────────────────────────────────────
function AlertBanner({ count, pendingRef, onVerDetalhes }: { count: number; pendingRef: string; onVerDetalhes: () => void }) {
  const slaDate = formatDate('2026-04-04') ;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="glass-card"
      style={{
        marginBottom: '24px',
        border: '1px solid rgba(239,68,68,0.3)',
        background: 'rgba(239,68,68,0.04)',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
      }}
    >
      {/* Severidade visual */}
      <div style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem',
      }}>
        🚨
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>ALERTA CRÍTICO</span>
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#991b1b', borderRadius: '99px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
            {count} pendências
          </span>
          <span style={{ background: 'rgba(245,158,11,0.12)', color: '#92400e', borderRadius: '99px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
            SLA: {slaDate}
          </span>
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', margin: 0 }}>
          <strong>UFRJ</strong> possui <strong>{count} guias</strong> pendentes de tratamento tributário na competência <strong>{formatRefLabel(pendingRef)}</strong>.
          Categoria: <em>Retenção Fiscal</em>. Responsável: Financeiro UFRJ. Atraso pode gerar multa.
        </p>
      </div>

      <button
        type="button"
        onClick={onVerDetalhes}
        aria-label="Abrir fila de pendências da UFRJ"
        style={{
          flexShrink: 0,
          background: '#dc2626', color: 'white', border: 'none',
          borderRadius: '8px', padding: '9px 16px', fontWeight: 700,
          cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
        onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
      >
        Abrir Fila →
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Sub-component: History Table
// ───────────────────────────────────────────────────────────
type SortField = 'data' | 'bruto' | 'statusId';
type SortDir = 'asc' | 'desc';

function HistoryTable({ payments, loading }: { payments: ReturnType<typeof getEffectivePayments>; loading: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [sortField, setSortField] = useState<SortField>('data');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...payments].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'data') cmp = a.data.localeCompare(b.data);
      else if (sortField === 'bruto') {
        const av = parseFloat(a.bruto.replace(/[^0-9,]/g, '').replace(',', '.'));
        const bv = parseFloat(b.bruto.replace(/[^0-9,]/g, '').replace(',', '.'));
        cmp = av - bv;
      } else if (sortField === 'statusId') cmp = a.statusId.localeCompare(b.statusId);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [payments, sortField, sortDir]);

  const PAGE = 3;
  const visible = expanded ? sorted : sorted.slice(0, PAGE);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const thStyle: React.CSSProperties = {
    padding: '12px 8px 12px 0',
    color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem',
    borderBottom: '2px solid var(--border-light)', cursor: 'pointer', userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  if (loading) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    );
  }

  if (payments.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
          Nenhum lançamento encontrado para esta competência.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
          Tente selecionar outro mês de referência acima.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '560px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} aria-label="Histórico da Planilha Mestra">
          <thead>
            <tr>
              <th scope="col" style={thStyle}>Profissional</th>
              <th scope="col" style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('data')}>
                Data {sortIcon('data')}
              </th>
              <th scope="col" style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('bruto')}>
                Bruto {sortIcon('bruto')}
              </th>
              <th scope="col" style={thStyle}>Convênio</th>
              <th scope="col" style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('statusId')}>
                Status {sortIcon('statusId')}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '14px 8px 14px 0', fontWeight: 500, color: 'var(--text-main)' }}>
                  <Link
                    href={`/pagamentos/${p.ident.replace('#', '')}`}
                    style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                    aria-label={`Ver detalhes do pagamento ${p.ident}`}
                  >
                    {p.nome}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.ident}</div>
                </td>
                <td style={{ padding: '14px 8px 14px 0', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(p.data)}
                </td>
                <td style={{ padding: '14px 8px 14px 0', fontWeight: 600, color: 'var(--text-main)' }}>
                  {p.bruto}
                </td>
                <td style={{ padding: '14px 8px 14px 0', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.convenio}
                </td>
                <td style={{ padding: '14px 8px 14px 0' }}>
                  <StatusBadge status={p.statusId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: '12px 0 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--border-light)', marginTop: '4px',
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Exibindo <strong>{visible.length}</strong> de <strong>{sorted.length}</strong> registros
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {sorted.length > PAGE && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', padding: 0,
              }}
            >
              {expanded ? 'Recolher ↑' : `Ver mais ${sorted.length - PAGE} →`}
            </button>
          )}
          <Link
            href="/pagamentos"
            style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}
          >
            Ver todos os lançamentos →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Sub-component: Export Modal
// ───────────────────────────────────────────────────────────
function ExportModal({
  isOpen, onClose, onConfirm, referencia, tenant, role,
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void; referencia: string; tenant: string; role: string }) {
  useEscapeToClose(isOpen, onClose);
  if (!isOpen) return null;

  const isReadOnly = role === 'auditoria';
  const refLabel = formatRefLabel(referencia);
  const tenantLabel = tenant === 'corp' ? 'Todos os Tenants (Corporativo)' : tenant.toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.5)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{ background: 'var(--bg-body)', borderRadius: '14px', width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}
      >
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 id="export-modal-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Exportar Relatório (CSV)
          </h3>
        </div>
        <div style={{ padding: '24px 28px' }}>
          {isReadOnly ? (
            <div style={{
              padding: '14px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)', color: '#92400e', fontSize: '0.875rem', fontWeight: 500,
            }}>
              ⚠️ Perfil <strong>Auditoria (Leitura)</strong> não tem permissão para exportar dados. Solicite ao perfil Admin ou Financeiro.
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
                Revise o escopo do relatório antes de confirmar:
              </p>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                {[
                  ['Formato', 'CSV (UTF-8)'],
                  ['Competência', refLabel],
                  ['Escopo', tenantLabel],
                  ['Campos', 'Profissional, CPF, Bruto, INSS, IRRF, Líquido, Status'],
                  ['Auditoria', 'Evento registrado na trilha do sistema'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '6px 0', color: 'var(--text-muted)', fontWeight: 600, width: '120px' }}>{k}</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-main)' }}>{v}</td>
                  </tr>
                ))}
              </table>
            </>
          )}
        </div>
        <div style={{ padding: '16px 28px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px', borderRadius: '8px', background: 'transparent',
              border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)',
            }}
          >
            Cancelar
          </button>
          {!isReadOnly && (
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: '10px 18px', borderRadius: '8px', background: 'var(--primary)',
                color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Confirmar Exportação
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Main Dashboard
// ───────────────────────────────────────────────────────────
function DashboardContent() {
  const appState = useAppState();
  const router = useRouter();

  const [referencia, setReferencia] = useState(appState.dashboardReferencia ?? '2026-02');
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [newAutonomo, setNewAutonomo] = useState({ nome: '', cpf: '' });
  const [formError, setFormError] = useState('');

  useEscapeToClose(Boolean(modalContent), () => setModalContent(null));

  const metrics = useMemo(() => getDashboardMetrics(appState, referencia), [appState, referencia]);

  // Fake loading ao trocar referência para evidenciar recarregamento
  const handleReferenciaChange = useCallback((newRef: string) => {
    setLoading(true);
    setReferencia(newRef);
    setDashboardReferencia(newRef);
    setTimeout(() => setLoading(false), 600);
  }, []);

  const handleExportConfirm = useCallback(() => {
    addAuditLog('dashboard', 'EXPORT_REPORT', `Relatório CSV exportado. Ref: ${referencia}, Tenant: ${appState.activeTenant}, Perfil: ${appState.role}`);

    const rows = [
      'Profissional,CPF,Convênio,Bruto,INSS,IRRF,Líquido,Status',
      ...metrics.historicoRecente.map(p =>
        `${p.nome},${p.cpf},${p.convenio},${p.bruto},${p.deducaoinss},${p.deducoirrf},${p.liquido},${p.statusId}`
      ),
    ];
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_retencoes_${appState.activeTenant}_${referencia}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, [metrics, referencia, appState.activeTenant, appState.role]);

  const handleVerDetalhes = () => {
    addAuditLog('dashboard', 'VIEW_ALERT_DETAILS', `Clicou em "Abrir Fila" para UFRJ na ref. ${referencia}`);
    router.push('/tenants');
  };

  const handleCreateAutonomo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAutonomo.nome.trim() || !newAutonomo.cpf.trim()) {
      setFormError('Preencha nome e CPF antes de salvar.');
      return;
    }
    addAuditLog('dashboard', 'OPEN_ROUTINE', 'Criação de Ficha de Autônomo iniciada pelo dashboard');
    setModalContent(null);
    setNewAutonomo({ nome: '', cpf: '' });
    setFormError('');
    router.push('/autonomos');
  };

  const isAuditoria = appState.role === 'auditoria';
  const tenant = appState.activeTenant;
  const lastUpdated = new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px' }}>

      {/* ── Modal: Rotinas ── */}
      {modalContent && (
        <div
          role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div className="animate-fade-in" style={{ background: 'var(--bg-body)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{modalContent}</h3>
              <button onClick={() => setModalContent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label="Fechar modal">&times;</button>
            </div>
            {modalContent === 'Processamento em Lote (Excel)' ? (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
                  Importe uma planilha Excel ou CSV com os lançamentos da competência <strong>{formatRefLabel(referencia)}</strong>.
                  Campos esperados: Nome, CPF, Bruto, Convênio, Competência.
                </p>
                <input type="file" accept=".csv,.xlsx,.xls" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px dashed var(--border-light)', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={() => { setModalContent(null); addAuditLog('dashboard', 'OPEN_ROUTINE', 'Processamento em Lote iniciado (upload)'); }} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Processar Arquivo</button>
                </div>
              </>
            ) : modalContent === 'Criar Ficha de Autônomo' ? (
              <form onSubmit={handleCreateAutonomo}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <input required type="text" value={newAutonomo.nome} onChange={e => { setNewAutonomo(c => ({ ...c, nome: e.target.value })); setFormError(''); }} placeholder="Nome Completo" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                  <input required type="text" value={newAutonomo.cpf} onChange={e => { setNewAutonomo(c => ({ ...c, cpf: e.target.value })); setFormError(''); }} placeholder="CPF (somente números)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                  {formError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: 0 }}>{formError}</p>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Ir para Cadastro →</button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text-muted)' }}>Esta rotina será disponibilizada em breve.</p>
                <button onClick={() => setModalContent(null)} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Fechar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Export Modal ── */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleExportConfirm}
        referencia={referencia}
        tenant={tenant}
        role={appState.role}
      />

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
              Visão Executiva {tenant !== 'corp' ? `— ${tenant.toUpperCase()}` : ''}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.875rem', margin: '6px 0 0 0' }}>
              Resumo das retenções consolidadas · Competência: <strong>{formatRefLabel(referencia)}</strong>
            </p>
          </div>

          {/* Controles: referência + exportar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="select-referencia" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Competência
              </label>
              <select
                id="select-referencia"
                value={referencia}
                onChange={(e) => handleReferenciaChange(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
              >
                {REFERENCIAS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {!isAuditoria && (
              <div>
                <div style={{ height: '22px' }} />
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  aria-label="Abrir opções de exportação de relatório"
                  style={{
                    background: 'var(--primary)', color: 'white', padding: '9px 18px',
                    borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <span aria-hidden="true">📥</span> Exportar Relatório
                </button>
              </div>
            )}

            {isAuditoria && (
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  👁 Perfil somente leitura
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Última atualização */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '10px', margin: '10px 0 0 0' }}>
          Última atualização: <strong>{lastUpdated}</strong>
          {metrics.syncStatus === 'atrasado' && (
            <span style={{ marginLeft: '10px', color: '#b45309', fontWeight: 600 }}>
              ⚠ Integração com {tenant.toUpperCase()} está atrasada
            </span>
          )}
        </p>
      </div>

      {/* ── ALERTA OPERACIONAL ── */}
      {metrics.totalGuiasPendentes > 0 && (
        <AlertBanner
          count={metrics.totalGuiasPendentes}
          pendingRef={referencia}
          onVerDetalhes={handleVerDetalhes}
        />
      )}

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <KpiCard
          label="Autônomos Ativos"
          value={String(metrics.autonomosAtivos)}
          delta={{ value: metrics.variacaoAutonomosMes, suffix: 'vs. mês anterior', tooltip: 'Delta de cadastros ativos comparado ao mês anterior' }}
          tooltip="Profissionais com cadastro ativo no período selecionado"
          loading={loading}
        />
        <KpiCard
          label="Valor Bruto Repassado"
          value={metrics.valorBrutoRepassadoStr}
          tooltip="Soma dos valores brutos de todos os contratos processados na competência selecionada"
          color="var(--primary)"
          loading={loading}
        />
        <KpiCard
          label="Impostos Retidos"
          value={metrics.impostosRetidosStr}
          tooltip="Soma das retenções de INSS e IRRF processadas nesta competência, antes da liquidação final"
          color="var(--danger)"
          loading={loading}
        />
        <KpiCard
          label="Em Análise"
          value={String(metrics.lancamentosEmAnalise)}
          tooltip="Lançamentos aguardando aprovação financeira neste período"
          color="#d97706"
          loading={loading}
        />
      </div>

      {/* ── MAIN GRID: Histórico + Rotinas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: '24px' }}>

        {/* Histórico */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Histórico da Planilha Mestra
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Competência: {formatRefLabel(referencia)}
            </span>
          </div>
          <div style={{ padding: '0 24px 4px 24px' }}>
            <HistoryTable payments={metrics.historicoRecente} loading={loading} />
          </div>
        </div>

        {/* Rotinas Sistêmicas */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>
            Rotinas Sistêmicas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Criar Ficha */}
            <button
              type="button"
              disabled={isAuditoria}
              onClick={() => {
                addAuditLog('dashboard', 'OPEN_ROUTINE', 'Abriu rotina: Criar Ficha de Autônomo');
                setModalContent('Criar Ficha de Autônomo');
              }}
              title={isAuditoria ? 'Perfil de Auditoria não pode criar registros' : 'Cadastrar novo prestador de serviços autônomo'}
              aria-label="Criar nova ficha de autônomo"
              style={{
                background: isAuditoria ? 'var(--bg-surface)' : 'var(--primary)',
                color: isAuditoria ? 'var(--text-muted)' : 'white',
                padding: '13px 14px', borderRadius: '8px', fontWeight: 600,
                textAlign: 'left', border: isAuditoria ? '1px solid var(--border-light)' : 'none',
                cursor: isAuditoria ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem',
                opacity: isAuditoria ? 0.55 : 1,
              }}
            >
              <span aria-hidden="true">➕</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Criar Ficha de Autônomo</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>Cadastrar novo prestador{isAuditoria ? ' (bloqueado)' : ''}</div>
              </div>
            </button>

            {/* Processamento em Lote */}
            <button
              type="button"
              disabled={isAuditoria}
              onClick={() => {
                addAuditLog('dashboard', 'OPEN_ROUTINE', 'Abriu rotina: Processamento em Lote');
                setModalContent('Processamento em Lote (Excel)');
              }}
              title={isAuditoria ? 'Perfil de Auditoria não pode processar lotes' : 'Importar planilha Excel ou CSV com lançamentos em lote'}
              aria-label="Processamento em lote via Excel"
              style={{
                background: 'var(--bg-surface)', border: `1px solid ${isAuditoria ? 'var(--border-light)' : 'var(--primary)'}`,
                color: isAuditoria ? 'var(--text-muted)' : 'var(--primary)',
                padding: '13px 14px', borderRadius: '8px', fontWeight: 600, textAlign: 'left',
                cursor: isAuditoria ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem',
                opacity: isAuditoria ? 0.55 : 1,
              }}
            >
              <span aria-hidden="true">📑</span>
              <div>
                <div style={{ fontWeight: 700 }}>Processamento em Lote</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>Importar planilha Excel/CSV{isAuditoria ? ' (bloqueado)' : ''}</div>
              </div>
            </button>

            <div style={{ height: '1px', background: 'var(--border-light)', margin: '6px 0' }} />

            {/* Editar Tabela SRF */}
            <Link
              href="/configuracoes"
              onClick={() => addAuditLog('dashboard', 'OPEN_ROUTINE', 'Navegou para Engenharia Tributária (Tabela SRF)')}
              aria-label="Editar tabela da SRF — requer perfil Admin"
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                color: 'var(--text-main)', padding: '13px 14px', borderRadius: '8px',
                fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem',
              }}
            >
              <span aria-hidden="true">⚙️</span>
              <div>
                <div style={{ fontWeight: 700 }}>Editar Tabela da SRF</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Faixas IRRF e alíquotas vigentes</div>
              </div>
            </Link>
          </div>

          {/* Mini-painel operacional */}
          <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', background: 'var(--bg-body)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>
              Painel Operacional
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Guias Pendentes', value: metrics.totalGuiasPendentes, color: metrics.totalGuiasPendentes > 0 ? '#dc2626' : 'var(--success)' },
                { label: 'Em Análise', value: metrics.lancamentosEmAnalise, color: metrics.lancamentosEmAnalise > 0 ? '#d97706' : 'var(--success)' },
                { label: 'Integração', value: metrics.syncStatus === 'ok' ? 'OK' : 'Atrasada', color: metrics.syncStatus === 'ok' ? 'var(--success)' : '#d97706' },
                { label: 'Lançamentos', value: metrics.historicoRecente.length, color: 'var(--primary)' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS responsivo inline (sem Tailwind) */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '24px' }}>
        <SkeletonCard height={60} />
        <SkeletonCard height={60} />
        <SkeletonCard height={60} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
