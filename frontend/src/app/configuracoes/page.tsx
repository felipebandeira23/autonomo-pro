"use client";
import React, { useState } from 'react';

export default function Configuracoes() {
  const [toast, setToast] = useState('');
  const [modalContent, setModalContent] = useState<string | null>(null);

  const handleSave = (moduleName: string) => {
    setToast(`As configurações de ${moduleName} foram salvas!`);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="animate-fade-in relative">

      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="animate-fade-in" style={{ background: 'var(--bg-body)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
                 <button onClick={() => setModalContent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              <div style={{ marginBottom: '24px' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ borderBottom: '1px solid var(--border-light)' }}>
                       <tr>
                          <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Faixa (Mês base)</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Alíquota (%)</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Parcela Dedutível (R$)</th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr><td style={{ padding: '8px' }}>Até R$ 2.259,20</td><td style={{ padding: '8px' }}>0,00</td><td style={{ padding: '8px' }}>0,00</td></tr>
                       <tr><td style={{ padding: '8px' }}>De R$ 2.259,21 até R$ 2.828,65</td><td style={{ padding: '8px' }}>7,50</td><td style={{ padding: '8px' }}>169,44</td></tr>
                       <tr><td style={{ padding: '8px' }}>De R$ 2.828,66 até R$ 3.751,05</td><td style={{ padding: '8px' }}>15,00</td><td style={{ padding: '8px' }}>381,44</td></tr>
                       <tr><td style={{ padding: '8px' }}>De R$ 3.751,06 até R$ 4.664,68</td><td style={{ padding: '8px' }}>22,50</td><td style={{ padding: '8px' }}>662,77</td></tr>
                       <tr><td style={{ padding: '8px' }}>Acima de R$ 4.664,68</td><td style={{ padding: '8px' }}>27,50</td><td style={{ padding: '8px' }}>896,00</td></tr>
                    </tbody>
                 </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                 <button onClick={() => { setModalContent(null); handleSave('Faixas Brackets IRRF'); }} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Confirmar Alterações Base</button>
              </div>
           </div>
        </div>
      )}

      {/* M05: Toast de confirmação */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--success)', color: 'white', padding: '16px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.3s ease-out' }}>
          <span>✅</span> {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Engenharia Tributária</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Gerencie as diretrizes de impostos sem edição de código. Valores defasados pela Receita Federal podem ser alterados pelo próprio órgão mantenedor.</p>
        </div>
        <button onClick={() => handleSave('Metas Globais')} style={{ background: 'var(--success)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
            <span>💾</span> Salvar Todas Metas
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)', gap: '24px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'rgba(0, 82, 204, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Previdência (INSS)</h3>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
              <span>Ano-Base Vigente</span>
            </label>
            <input type="text" defaultValue="2026" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Alíquota do Cálculo (%)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="11,00" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '40px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>%</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Teto Máximo do Desconto</label>
            <div style={{ position: 'relative' }}>
              {/* M06: Formatar Numérico com Máscara Monetária */}
              <input type="text" defaultValue="932,32" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>O INSS não ultrapassará este valor somado outras fontes.</p>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'rgba(222, 53, 11, 0.1)', borderRadius: '8px', color: 'var(--danger)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Imposto de Renda (IRRF)</h3>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Dedução fixa por Dependente</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="189,59" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Trava da Dedução Simplificada</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="607,20" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Para aplicar apenas na primeira faixa se não exceder Redutor (Art 15).</p>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', border: '1px dashed var(--border-light)', background: 'rgba(9,30,66,0.02)' }}>
             <button onClick={() => setModalContent('Brackets SRF Mapeados (Edição Avançada)')} style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}><span>⚙️</span> Editar Tabela de Faixas Dinâmicas (Brackets)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
