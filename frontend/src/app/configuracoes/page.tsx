"use client";

import React, { useState } from 'react';
import { irrfBrackets } from '@/lib/mock-data';
import { useEscapeToClose } from '@/lib/use-escape-to-close';

export default function Configuracoes() {
  const [toast, setToast] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [brackets, setBrackets] = useState(irrfBrackets);
  useEscapeToClose(modalOpen, () => setModalOpen(false));

  const handleSave = (moduleName: string) => {
    setToast(`As configuracoes de ${moduleName} foram salvas.`);
    window.setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="animate-fade-in relative">
      {modalOpen && (
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
              maxWidth: '760px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Brackets SRF Mapeados (Edicao Avancada)</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                &times;
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Faixa (Mes base)</th>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Aliquota (%)</th>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Parcela Dedutivel (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((bracket, index) => (
                    <tr key={bracket.faixa}>
                      <td style={{ padding: '8px' }}>{bracket.faixa}</td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={bracket.aliquota}
                          onChange={(event) =>
                            setBrackets((current) =>
                              current.map((item, itemIndex) => (itemIndex === index ? { ...item, aliquota: event.target.value } : item)),
                            )
                          }
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={bracket.parcelaDedutivel}
                          onChange={(event) =>
                            setBrackets((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, parcelaDedutivel: event.target.value } : item,
                              ),
                            )
                          }
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  handleSave('Faixas Brackets IRRF');
                }}
                style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirmar Alteracoes Base
              </button>
            </div>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Engenharia Tributaria</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Gerencie as diretrizes de impostos sem edicao de codigo. Valores defasados podem ser alterados pelo proprio orgao mantenedor.
          </p>
        </div>
        <button onClick={() => handleSave('Metas Globais')} style={{ background: 'var(--success)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
          <span>💾</span> Salvar Todas Metas
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)', gap: '24px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'rgba(0, 82, 204, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Previdencia (INSS)</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
              <span>Ano-Base Vigente</span>
            </label>
            <input type="text" defaultValue="2026" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Aliquota do Calculo (%)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="11,00" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '40px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>%</span>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Teto Maximo do Desconto</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="932,32" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>O INSS nao ultrapassara este valor somado a outras fontes.</p>
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
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Deducao fixa por Dependente</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="189,59" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Trava da Deducao Simplificada</label>
            <div style={{ position: 'relative' }}>
              <input type="text" defaultValue="607,20" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Para aplicar apenas na primeira faixa se nao exceder o redutor.</p>
          </div>
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', border: '1px dashed var(--border-light)', background: 'rgba(9,30,66,0.02)' }}>
            <button onClick={() => setModalOpen(true)} style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span>⚙️</span> Editar Tabela de Faixas Dinamicas (Brackets)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
