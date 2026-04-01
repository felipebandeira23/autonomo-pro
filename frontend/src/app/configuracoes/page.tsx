"use client";

import React, { useState, useEffect } from 'react';
import { useEscapeToClose } from '@/lib/use-escape-to-close';
import { useAppState, addToast } from '@/lib/app-state';

export default function Configuracoes() {
  const appState = useAppState();
  const { role } = appState;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [saveTarget, setSaveTarget] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  
  const [configParams, setConfigParams] = useState({
    year: 2026,
    inssRate: 11.0,
    inssCeiling: 932.32,
    dependentDeduction: 189.59,
    irrfBrackets: [] as any[]
  });

  const [brackets, setBrackets] = useState<any[]>([]);

  useEscapeToClose(modalOpen || Boolean(saveTarget), () => {
    setModalOpen(false);
    setSaveTarget(null);
  });

  useEffect(() => {
    fetch('http://localhost:3001/tax/config?year=2026', {
      headers: {
        'x-tenant-id': appState.activeTenant === 'corp' ? '' : 'UFRJ_ID'
      }
    })
      .then(r => r.json())
      .then(data => {
        setConfigParams({
          year: data.year,
          inssRate: data.inssRate * 100, // stored as 0.11, display as 11
          inssCeiling: data.inssCeiling,
          dependentDeduction: data.dependentDeduction,
          irrfBrackets: data.irrfBrackets
        });
        setBrackets(data.irrfBrackets);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        addToast('Erro ao carregar configurações do motor de imposto', 'error');
        setLoading(false);
      });
  }, [appState.activeTenant]);

  const handleSaveAll = async () => {
    if (role === 'auditoria') {
      addToast('Acesso negado: Perfil Auditoria possui apenas permissão de leitura.', 'error');
      return;
    }
    
    try {
      const payload = {
        ...configParams,
        inssRate: configParams.inssRate / 100,
        irrfBrackets: brackets
      };

      const res = await fetch('http://localhost:3001/tax/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': appState.activeTenant === 'corp' ? '' : 'UFRJ_ID',
          'x-user-role': role.toUpperCase()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast(`As configurações do motor de SSOT foram salvas com sucesso.`, 'success');
        setSaveTarget(null);
      } else {
        const d = await res.json();
        addToast('Erro ao salvar: ' + d.message, 'error');
      }
    } catch (e) {
      addToast('Erro de comunicação.', 'error');
    }
  };

  const handleBracketSave = () => {
    for (const b of brackets) {
      const aliquotaStr = String(b.rate);
      const deducaoStr = String(b.deduction);
      
      const parsedAliquota = parseFloat(aliquotaStr);
      const parsedDedutivel = parseFloat(deducaoStr);
      
      if (isNaN(parsedAliquota) || isNaN(parsedDedutivel)) {
        addToast('Erro de validação: Insira apenas numéricos válidos.', 'error');
        return;
      }
      
      if (parsedAliquota > 0.275 || parsedAliquota < 0) {
        addToast('Aviso de Negócio: A alíquota do IRRF deve estar entre 0 e 0.275', 'error');
        return;
      }
    }
    setModalOpen(false);
    // Atualiza o state master, mas o save real acontece  no handleSaveAll
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfigParams(prev => ({ ...prev, [key]: parseFloat(value.replace(',', '.')) || 0 }));
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Sincronizando com o Motor Fiscal...</div>;

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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Brackets SRF Mapeados (Edição Avançada)</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                &times;
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Piso (Min)</th>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Teto (Max)</th>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Alíquota (Decimal)</th>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Parcela Dedutível (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((bracket, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>R$ {bracket.min}</td>
                      <td style={{ padding: '8px' }}>{bracket.max === null ? 'Infinito' : `R$ ${bracket.max}`}</td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={bracket.rate}
                          onChange={(e) =>
                            setBrackets((current) =>
                              current.map((item, i) => (i === index ? { ...item, rate: parseFloat(e.target.value) } : item))
                            )
                          }
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={bracket.deduction}
                          onChange={(e) =>
                            setBrackets((current) =>
                              current.map((item, i) =>
                                i === index ? { ...item, deduction: parseFloat(e.target.value) } : item
                              )
                            )
                          }
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-rose-500 mt-4 font-semibold">Tabela provida externamente, edite com cautela a matriz algoritmica.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={handleBracketSave}
                style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirmar Alterações Temporárias
              </button>
            </div>
          </div>
        </div>
      )}

      {saveTarget && (
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Atenção: Trilha de Validação</h3>
              <button onClick={() => setSaveTarget(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                &times;
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Sua edição nas tabelas e teto será guardada via hash na trilha de auditoria e aplicada aos fechamentos abertos imediatamente na base ({configParams.year}). Confirmar gravação no Motor SSOT?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setSaveTarget(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>
                Revisar Valores
              </button>
              <button
                onClick={handleSaveAll}
                style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--success)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Auditar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Engenharia Tributária</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Gerencie as diretrizes de impostos via SSOT Backend (Single Source of Truth). As regras tem versionamento automático pelo ano corrente.
          </p>
        </div>
        <button 
          onClick={() => {
            if (role === 'auditoria') {
              addToast('Perfil sem permissão para salvar metas globais.', 'error');
            } else {
              setSaveTarget('Metas Globais');
            }
          }} 
          style={{ background: role === 'auditoria' ? 'var(--border-light)' : 'var(--success)', color: role === 'auditoria' ? 'var(--text-muted)' : 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: role === 'auditoria' ? 'not-allowed' : 'pointer' }}
        >
          <span>💾</span> Registrar em Auditoria (SSOT)
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
              <span>Ano-Base Registrado</span>
            </label>
            <input type="text" disabled value={configParams.year} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Alíquota do Cálculo (%)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" value={configParams.inssRate} onChange={e => handleConfigChange('inssRate', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '40px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>%</span>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Teto Máximo do Desconto (R$)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" value={configParams.inssCeiling} onChange={e => handleConfigChange('inssCeiling', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>O INSS não ultrapassará este valor somado a outras fontes.</p>
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
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Dedução fixa por Dependente (R$)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" value={configParams.dependentDeduction} onChange={e => handleConfigChange('dependentDeduction', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Dedução Simplificada de Substituição (R$)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" disabled value="607.20" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', paddingLeft: '44px', cursor: 'not-allowed' }} />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>R$</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protegido para bater apenas se for mais viável que dedução estrita/dependentes.</p>
          </div>
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', border: '1px dashed var(--border-light)', background: 'rgba(9,30,66,0.02)' }}>
            <button 
              onClick={() => {
                if (role === 'auditoria') {
                  addToast('Perfil Auditoria não pode editar faixas dinâmicas.', 'error');
                } else {
                  setModalOpen(true);
                }
              }} 
              style={{ color: role === 'auditoria' ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: role === 'auditoria' ? 'not-allowed' : 'pointer' }}
            >
              <span>⚙️</span> Editar Tabela de Faixas Dinâmicas (Brackets)
            </button>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Autenticação & LDAP/SSO</h3>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Servidor LDAP</label>
            <input type="text" disabled defaultValue="ldap://********.ufrj.br" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Bind DN Autenticado</label>
            <input type="password" disabled defaultValue="*************************" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Cofre corporativo: credenciais mascaradas e protegidas via KMS.</p>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Integração E-mail (Notificações)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="password" disabled defaultValue="**********************" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
              <button type="button" onClick={() => addToast('Edição de SMTP está bloqueada para acesso via web. Contate o SRE.', 'error')} style={{ padding: '0 16px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>Editar</button>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Utilizado para reportar RPAs em atraso e Guias de Recolhimento aos executivos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
