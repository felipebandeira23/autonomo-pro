"use client";
import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant') || 'corp';

  const [modalContent, setModalContent] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const tenantData = {
    corp: { ativos: 142, repasses: 'R$ 1.25M', retidos: 'R$ 384k', status: 'Sincronizado' },
    ufrj: { ativos: 84, repasses: 'R$ 800k', retidos: 'R$ 200k', status: 'Sincronizado' },
    coppetec: { ativos: 58, repasses: 'R$ 450k', retidos: 'R$ 184k', status: 'Atrasado' },
  };

  const data = tenantData[tenant as keyof typeof tenantData] || tenantData.corp;

  const handleExport = () => {
    // M02: Ação Real de Exportação CSV
    const csvContent = "data:text/csv;charset=utf-8,Profissional,Data,Bruto\nEduardo Vargas,13/02/2026,4533.43";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_retencoes.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="animate-fade-in relative">
      
      {/* BUG-001 Generic Modal Handler */}
      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="animate-fade-in" style={{ background: 'var(--bg-body)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
                 <button onClick={() => setModalContent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              
              {modalContent === 'Processamento em Lote' ? (
                  <div style={{ marginBottom: '24px' }}>
                     <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>Selecione o arquivo Excel ou CSV</label>
                     <input type="file" accept=".csv, .xlsx, .xls" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px dashed var(--border-light)', cursor: 'pointer' }} />
                  </div>
              ) : modalContent === 'Criar Ficha de Autônomo' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                     <input type="text" placeholder="Nome Completo" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                     <input type="text" placeholder="CPF" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                  </div>
              ) : (
                  <div style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Interface de contexto carregada remotamente.</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Salvar Operação</button>
              </div>
           </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Visão Executiva {tenant !== 'corp' ? `- ${tenant.toUpperCase()}` : ''}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Resumo das retenções consolidadas no período.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', fontWeight: 600, color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
            <option>Ref: Fevereiro/2026</option>
            <option>Ref: Janeiro/2026</option>
            <option>Ref: Dezembro/2025</option>
          </select>
          <button onClick={handleExport} style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📥</span> Exportar Relatório
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Autônomos Ativos</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>{data.ativos}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '8px' }}>+12 neste mês</div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Valor Bruto Repassado</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>{data.repasses}</div>
        </div>

        <div className="glass-card" style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Impostos Retidos
            
            {/* BUG-NEW-01 Hover Tooltip */}
            <span 
              onMouseEnter={() => setShowTooltip(true)} 
              onMouseLeave={() => setShowTooltip(false)}
              style={{ position: 'relative', display: 'inline-flex', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--border-light)', color: 'var(--text-muted)', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', cursor: 'help' }}
            >
              ?
              {showTooltip && (
                <div style={{ position: 'absolute', bottom: '150%', left: '50%', transform: 'translateX(-50%)', padding: '12px', background: 'var(--text-main)', color: 'white', fontSize: '0.75rem', borderRadius: '8px', width: '220px', zIndex: 10, textAlign: 'left', pointerEvents: 'none', boxShadow: 'var(--shadow-md)', lineHeight: '1.4' }}>
                  Soma dos descontos de INSS (até o teto) e IRRF incidentes nos repasses, abatidos antes do pagamento líquido.
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '6px solid transparent', borderTopColor: 'var(--text-main)' }}></div>
                </div>
              )}
            </span>

          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)', marginTop: '8px' }}>{data.retidos}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Histórico da Planilha Mestra</h3>
            <button onClick={() => router.push('/pagamentos')} style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}>Ver Todos Lançamentos →</button>
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
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 0', fontWeight: 500, color: 'var(--text-main)' }}>Eduardo Raupp de Vargas</td>
                  <td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>13/02/2026</td>
                  <td style={{ padding: '16px 0', fontWeight: 600 }}>R$ 4.533,43</td>
                  <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 600 }}>Sync Concluído</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 0', fontWeight: 500, color: 'var(--text-main)' }}>Adriana Aparecida Marques</td>
                  <td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>12/02/2026</td>
                  <td style={{ padding: '16px 0', fontWeight: 600 }}>R$ 4.124,24</td>
                  <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontWeight: 600 }}>Falta Declaração</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-main)' }}>Rotinas Sistêmicas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => setModalContent('Criar Ficha de Autônomo')} style={{ background: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 600, textAlign: 'left', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <span>➕</span> Criar Ficha de Autônomo
            </button>
            <button onClick={() => setModalContent('Processamento em Lote')} style={{ background: 'var(--bg-surface)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '14px', borderRadius: '8px', fontWeight: 600, textAlign: 'left', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span>📑</span> Processamento em Lote (Excel)
            </button>
            <button onClick={() => router.push('/configuracoes')} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '14px', borderRadius: '8px', fontWeight: 600, textAlign: 'left', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', cursor: 'pointer' }}>
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
    <Suspense fallback={<div>Carregando Visualização Corporativa...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
