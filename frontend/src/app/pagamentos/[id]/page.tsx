"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppState, addToast } from '@/lib/app-state';
import { getPaymentByCode, getPaymentStatusMeta } from '@/lib/mock-data';

export default function DetalhePagamento() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const idStr = rawId || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulando um fetch pro backend
    setTimeout(() => {
      const record = getPaymentByCode(idStr);
      setData(record);
      setLoading(false);
    }, 400);
  }, [idStr]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Buscando memória de cálculo...</div>;

  if (!data) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Recibo não encontrado</h2>
      <button onClick={() => router.push('/pagamentos')} style={{ marginTop: '16px', padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>Voltar</button>
    </div>
  );

  const statusMeta = getPaymentStatusMeta(data.statusId);

  return (
    <div className="animate-fade-in relative" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <button onClick={() => router.push('/pagamentos')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            &larr; Voltar para a Fila
          </button>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Recibo #{idStr}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Competência: {data.referencia} • Emissão: {data.data}</p>
        </div>
        <div>
          <span
            style={{
              background: statusMeta.style,
              color: statusMeta.color,
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {statusMeta.detailBadge}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '32px' }}>
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Dados do Favorecido</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nome do Profissional</p>
                <p style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '4px' }}>{data.nome}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documento Físico</p>
                <p style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '4px' }}>{data.cpf}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vínculo/Convênio</p>
                <p style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '4px' }}>{data.convenio}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Cadastral</p>
                <p style={{ fontWeight: 600, color: 'var(--success)', marginTop: '4px' }}>Ativo Validado</p>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Memória de Cálculo (Lógica de Retenção)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Valor Bruto do Repasse</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{data.bruto}</span>
              </div>
              
              <div style={{ paddingLeft: '16px', borderLeft: '3px solid var(--secondary)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>(-) INSS Retido na Fonte</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>R$ {data.deducaoinss}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  11% sobre o Bruto. {parseFloat(data.deducaoinss?.replace(',', '.') || '0') >= 932.32 ? 'Teto de Contribuição atingido.' : 'Abaixo do teto máximo.'}
                </p>
              </div>

              <div style={{ paddingLeft: '16px', borderLeft: '3px solid var(--secondary)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>(-) Imposto de Renda (IRRF)</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>R$ {data.deducoirrf}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Base de Cálculo = Bruto - INSS - Dependentes. Tabela Progressiva aplicada automaticamente.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem' }}>Valor Líquido a Pagar</span>
                <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.25rem' }}>{data.liquido}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trilha de Auditoria</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border-light)' }}>
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', left: '-23px', top: '4px' }}></div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Cálculo Gerado</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>Pelo Motor de Impostos (Sistema)</p>
              </div>
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', left: '-23px', top: '4px' }}></div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Enviado para Elaboração</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>Por Operador do Convênio</p>
              </div>
              
              {data.statusId !== 'elaboracao' && (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '12px', height: '12px', background: data.statusId === 'pago' ? 'var(--success)' : 'var(--secondary)', borderRadius: '50%', left: '-23px', top: '4px' }}></div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {data.statusId === 'aprovacao' ? 'Aprovação Pendente' : 'RPA Finalizada / Paga'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestor Administrativo</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ações Contextuais</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <button 
                onClick={() => { addToast('Recibo PDF exportado com sucesso', 'success') }}
                style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                📥 Baixar RPA em PDF
              </button>
              
              {data.statusId === 'elaboracao' && (
                <button 
                  onClick={() => { addToast('Submetido para aprovação da chefia', 'success'); router.push('/pagamentos') }}
                  style={{ width: '100%', padding: '10px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  🚀 Submeter para Aprovação
                </button>
              )}

              {data.statusId === 'aprovacao' && (
                <>
                  <button 
                    onClick={() => { addToast('Pagamento Liberado na Instituição', 'success'); router.push('/pagamentos') }}
                    style={{ width: '100%', padding: '10px', background: 'var(--success)', border: 'none', color: 'white', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    ✅ Aprovar Operação
                  </button>
                  <button 
                    onClick={() => { addToast('Lote de pagamento rejeitado', 'info'); router.push('/pagamentos') }}
                    style={{ width: '100%', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    ❌ Devolver para Correção
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
