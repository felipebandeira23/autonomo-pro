"use client";
import React, { use, useState } from 'react';
import Link from 'next/link';

const db = {
  'RPA-1042': { nome: 'Eduardo Raupp de Vargas', cpf: '***.341.22*-**', bruto: 'R$ 4.533,43', liquido: 'R$ 3.789,71', deducaoinss: '498,67', deducoirrf: '245,05', convenio: 'Pós-Graduação UFRJ', realid: '9b2fc304-4537-4d9f-a2b1-1234567890f1' },
  'RPA-1043': { nome: 'Debora Alves dos Santos', cpf: '***.892.11*-**', bruto: 'R$ 18.250,00', liquido: 'R$ 15.794,90', deducaoinss: '932,32', deducoirrf: '1.522,78', convenio: 'Auditoria Independente', realid: 'c83fb304-4537-4d9f-a2b1-1234567812ab' },
  'RPA-1044': { nome: 'Joao Carlos da Silva', cpf: '***.123.45*-**', bruto: 'R$ 2.500,00', liquido: 'R$ 2.500,00', deducaoinss: '0,00', deducoirrf: '0,00', convenio: 'Consultoria Acadêmica', realid: 'e12da304-4537-4d9f-a2b1-1234567899cc' },
};

export default function PagamentoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idStr = resolvedParams?.id || 'NOVO';
  const data = db[idStr as keyof typeof db] || db['RPA-1042'];

  const [docStatus, setDocStatus] = useState('aprovacao'); // ['aprovacao', 'pago', 'rejeitado']
  const [modalContent, setModalContent] = useState<string | null>(null);

  const handleApprove = () => {
      setDocStatus('pago');
  };

  const handleReject = () => {
      setModalContent('Motivo da Rejeição');
  };

  const confirmRejection = () => {
      setDocStatus('rejeitado');
      setModalContent(null);
  };

  return (
    <div className="animate-fade-in relative">

      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="animate-fade-in" style={{ background: 'var(--bg-body)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
                 <button onClick={() => setModalContent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              <div style={{ marginBottom: '24px' }}>
                 <textarea placeholder="Descreva brevemente por que este fluxo de retenção/RPA não é válido e retorne a competência." rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', fontFamily: 'inherit', resize: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                 <button onClick={confirmRejection} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Confirmar Rejeição</button>
              </div>
           </div>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        
        {/* M09 Voltar para pagamentos Top */}
        <div style={{ marginBottom: '20px' }}>
          <Link href="/pagamentos" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', boxShadow: 'var(--shadow-sm)' }}>
             <span>←</span> Retornar para Tabela
          </Link>
        </div>

        {/* BUG-NEW-04 Breadcrumb completo */}
        <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard Início</Link>
          <span style={{ margin: '0 8px' }}>&gt;</span>
          <Link href="/pagamentos" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Pagamentos Mestra</Link>
          <span style={{ margin: '0 8px' }}>&gt;</span>
          <span style={{ color: 'var(--primary)' }}>#{idStr}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Lançamento #{idStr}</h2>
              {docStatus === 'aprovacao' && <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Em Aprovação</span>}
              {docStatus === 'pago' && <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Ordem de Pagamento Aprovada</span>}
              {docStatus === 'rejeitado' && <span style={{ background: 'rgba(222, 53, 11, 0.1)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>RPA Rejeitada Internamente</span>}
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Gerado via API de Lotes Automáticos</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {docStatus === 'aprovacao' ? (
                <>
                    <button onClick={handleReject} style={{ background: 'var(--bg-surface)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <span>❌</span> Rejeitar Lançamento
                    </button>
                    <button onClick={handleApprove} style={{ background: 'var(--success)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
                        <span>✅</span> Aprovar e Liquidar
                    </button>
                </>
            ) : (
                <button disabled style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-muted)', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔒</span> Trilha Fechada e Assinada
                </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Dados Contratuais Pessoais</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Profissional Autônomo</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem' }}>{data.nome}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CPF: {data.cpf}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Centro de Custo / Convênio</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.05rem' }}>{data.convenio}</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🧮</span> Matemática Fiscal Aplicada</h3>
            <div style={{ background: 'rgba(9, 30, 66, 0.02)', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Valor Bruto Integrado</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{data.bruto}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', color: 'var(--danger)' }}>
                <span style={{ fontWeight: 500 }}>(-) Retenção Calculada INSS (11%)</span>
                <span style={{ fontWeight: 600 }}>R$ {data.deducaoinss}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', color: 'var(--danger)', marginTop: '8px' }}>
                <span style={{ fontWeight: 500 }}>(-) Retenção Calculada IRRF / Deduções Legais</span>
                <span style={{ fontWeight: 600 }}>R$ {data.deducoirrf}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-light)', marginTop: '16px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem' }}>Montante Líquido Final Estimado</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.4rem' }}>{data.liquido}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Universal ID: {data.realid}</span>
               <a href={`/api/payments/${idStr}/receipt`} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--primary-light)', padding: '10px 16px', borderRadius: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                 <span>📄</span> Baixar Espelho do Recibo (RPA)
               </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Trilha de Auditoria Universal</h3>
            <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-light)' }}>
              
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }}></div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Emissão da Ordem via CSV</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14/02/2026 - 14:00</div>
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }}></div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Aprovação Técnica</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14/02/2026 - 15:30 (João Pedro Coordenação)</div>
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: docStatus === 'pago' ? 'var(--success)' : docStatus === 'rejeitado' ? 'var(--danger)' : 'var(--warning)', backgroundColor: docStatus === 'aprovacao' ? '#f59e0b' : undefined, border: '2px solid white', boxShadow: docStatus === 'aprovacao' ? '0 0 0 4px rgba(245, 158, 11, 0.2)' : 'none' }}></div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: docStatus === 'aprovacao' ? 'var(--primary)' : 'var(--text-main)' }}>Liberação Financeira (Assinatura Diretoria)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{docStatus === 'aprovacao' ? 'Travado aguardando clique visual de validação para liquidar.' : docStatus === 'pago' ? 'Assinado por Felipe Diretoria' : 'Rejeitado e devolvido com estorno.'}</div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: docStatus === 'pago' ? 'var(--success)' : 'var(--border-light)', border: '2px solid white' }}></div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: docStatus === 'pago' ? 'var(--text-main)' : 'var(--text-muted)' }}>Remessa Bancária SIG Liquidada</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{docStatus === 'pago' ? 'Liquidado imediatamente (API Bank Mock)' : '-- pendente aprovação --'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
