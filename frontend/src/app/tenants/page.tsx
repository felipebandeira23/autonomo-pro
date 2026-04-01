"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { getDerivedTenantMetrics, useAppState, createTenant, updateTenant, addToast } from '@/lib/app-state';
import { useEscapeToClose } from '@/lib/use-escape-to-close';

type ModalType = 'global' | 'create' | null;

export default function Tenants() {
  const appState = useAppState();
  const metrics = getDerivedTenantMetrics(appState);
  const tenants = Object.values(appState.tenants).filter((t: any) => t.id !== 'corp');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: '', cnpj: '' });
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1);
  useEscapeToClose(Boolean(modalType), () => {
    setModalType(null);
    setStep(1);
  });

  const showToast = (message: string) => {
    addToast(message, 'info');
  };

  const handleCreateTenant = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.nome.trim() || !formData.cnpj.trim()) {
      setFormError('Preencha nome da instituicao e CNPJ.');
      return;
    }

    const newId = formData.nome.toLowerCase().replace(/[^a-z0-9]/g, '');
    createTenant(newId, formData.nome, formData.cnpj);
    
    setModalType(null);
    setFormData({ nome: '', cnpj: '' });
    setFormError('');
    addToast('Instituição cadastrada com sucesso.', 'success');
  };

  return (
    <div className="animate-fade-in relative">
      {modalType && (
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
              maxWidth: '520px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {modalType === 'global' ? 'Consolidado Global' : 'Fundar Instituição'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            {modalType === 'global' ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '12px',
                    marginBottom: '24px',
                  }}
                >
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Ativos
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '1.75rem', fontWeight: 700 }}>{metrics.totalAtivos}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Repasses
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '1.75rem', fontWeight: 700 }}>R$ 1.61Mi</div>
                  </div>
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Pendencias
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>{metrics.ufrjPendingGuides}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setModalType(null)}
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
                    Fechar painel
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleCreateTenant}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }} />
                  <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--primary)' : 'var(--border-light)', borderRadius: '2px', transition: 'background 0.3s' }} />
                  <div style={{ flex: 1, height: '4px', background: step >= 3 ? 'var(--primary)' : 'var(--border-light)', borderRadius: '2px', transition: 'background 0.3s' }} />
                </div>

                {step === 1 && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Passo 1: Identificação da Entidade (CNPJ Matriz)</p>
                    <input
                      required
                      type="text"
                      value={formData.nome}
                      onChange={(event) => {
                        setFormData((current) => ({ ...current, nome: event.target.value }));
                        setFormError('');
                      }}
                      placeholder="Nome da instituição"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
                    />
                    <input
                      required
                      type="text"
                      value={formData.cnpj}
                      onChange={(event) => {
                        setFormData((current) => ({ ...current, cnpj: event.target.value }));
                        setFormError('');
                      }}
                      placeholder="CNPJ"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Passo 2: Dimensionamento do Limite de Escopo Multitenant</p>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Plano de Execução RPA Mensal</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
                      <option>Foundation (Até 100 RPAs / mês)</option>
                      <option>Scale (Sem Limite Transacional)</option>
                    </select>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>E-mail do Gestor Raiz</label>
                    <input type="email" placeholder="admin@instituicao.org.br" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>☁️</div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Confirmar Provisionamento</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>O ambiente <strong>{formData.nome || 'Instituição'}</strong> receberá um banco de dados isolado no PostgreSQL, engine de impostos instanciada e roles em até 60 segundos.</p>
                  </div>
                )}

                {formError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '16px' }}>{formError}</p>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (step > 1) {
                        setStep(step - 1);
                      } else {
                        setModalType(null);
                        setStep(1);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: '1px solid var(--border-light)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--text-main)'
                    }}
                  >
                    {step === 1 ? 'Cancelar' : 'Voltar'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      if (step < 3) {
                        if (step === 1 && (!formData.nome || !formData.cnpj)) {
                          setFormError('Por favor, preencha os dados primários.');
                          return;
                        }
                        setStep(step + 1);
                      } else {
                        handleCreateTenant(e as any);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: step === 3 ? 'var(--success)' : 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {step === 3 ? 'Autorizar e Criar Instituição' : 'Avançar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Unidades Gestoras Corporativas</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Arquitetura multi-tenant isolada: gerencie as diferentes entidades arrecadadoras e fundações.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={() => {
              const headers = ['Tenant', 'CNPJ', 'Ativos', 'Repasses (Mes)', 'Impostos (Mes)', 'Pendencias'];
              const rows = tenants.map((t: any) => [
                t.label, 
                t.cnpj, 
                t.baseAtivos, 
                t.repassesMes.replace('R$ ', ''), 
                t.impostosMes.replace('R$ ', ''), 
                t.pendencias
              ]);
              const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `billing_corporativo_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              addToast('Relatório de Billing Exportado.', 'success');
            }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <span>📥</span> Exportar Billing
          </button>
          <button
            onClick={() => setModalType('global')}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <span>📊</span> Consolidado Global
          </button>
          <button
            onClick={() => setModalType('create')}
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
          >
            <span>+</span> Fundar Instituição
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Mostrando {tenants.length} unidade(s) gestora(s) ativas
        </div>
      </div>

      <div className="tenant-grid">
        {tenants.map((tenant: any) => (
          <div key={tenant.id} className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: 0, transition: 'all 0.2s' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: tenant.id === 'ufrj' ? 'var(--success)' : '#f59e0b',
              }}
            />
            <div style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{tenant.label}</h3>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenMenu((current) => (current === tenant.id ? null : tenant.id))}
                    style={{ color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    •••
                  </button>
                  {openMenu === tenant.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '36px',
                        right: 0,
                        minWidth: '170px',
                        background: 'white',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 10,
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => {
                          setOpenMenu(null);
                          addToast(`Edicao de ${tenant.label} requer painel avançado (em desenvolvimento).`, 'info');
                        }}
                        style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                      >
                        Editar Parâmetros
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenu(null);
                          updateTenant(tenant.id, { status: 'Atrasado' as any });
                          addToast(`${tenant.label} inativada / suspensa com sucesso.`, 'success');
                        }}
                        style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)' }}
                      >
                        Desativar Instituição
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'monospace' }}>
                CNPJ: {tenant.cnpj}
              </p>

              <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Repasses no Mes (Fev)</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 700 }}>{tenant.repassesMes}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Impostos Retidos (GFIP/DARF)</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 700 }}>{tenant.impostosMes}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pendencias de Aprovacao</span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      background: tenant.pendenciasCriticas ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: tenant.pendenciasCriticas ? 'var(--danger)' : 'var(--text-muted)',
                      padding: tenant.pendenciasCriticas ? '2px 8px' : '0',
                      borderRadius: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {tenant.id === 'ufrj' ? `${metrics.ufrjPendingGuides} Guias` : tenant.pendencias}
                  </span>
                </div>
              </div>

              <div className="tenant-card-footer">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Usuarios</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>{tenant.usuarios}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Base Ativos</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>{tenant.baseAtivos}</div>
                </div>
                <div className="tenant-card-footer-action">
                  <Link href={`/?tenant=${tenant.id}`} className="workspace-button" style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                    Acessar Workspace
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setModalType('create')}
          className="glass-card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', border: '2px dashed var(--border-light)', cursor: 'pointer', background: 'transparent' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>+</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>Cadastrar Instituição</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', maxWidth: '80%', marginTop: '8px' }}>
            Crie um ambiente isolado para o novo convenio.
          </p>
        </button>
      </div>
    </div>
  );
}
