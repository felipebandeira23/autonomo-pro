"use client";
import React from 'react';
import Link from 'next/link';

export default function Tenants() {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Unidades Gestoras Corporativas</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Arquitetura Multi-Tenant isolada: gerencie as diferentes entidades arrecadadoras e fundações.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => alert('Funcionalidade de mock visual. Integração de API em desenvolvimento na próxima fase.')} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span> Consolidado Global
          </button>
          <button onClick={() => alert('Funcionalidade de mock visual. Integração de API em desenvolvimento na próxima fase.')} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>+</span> Fundar Instituição
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Tenant Card 1 - UFRJ */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: 0, cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--success)' }}></div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>UFRJ - Reitoria</h3>
              <button onClick={() => alert('Funcionalidade de mock visual. Integração de API em desenvolvimento na próxima fase.')} style={{ color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px' }}>•••</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'monospace' }}>CNPJ: 33.663.683/0001-16</p>
            
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Repasses no Mês (Fev)</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 700 }}>R$ 1.2Mi</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Impostos Retidos (GFIP/DARF)</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 700 }}>R$ 384k</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pendências de Aprovação</span>
                <span style={{ fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>14 Guias</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Usuários</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>12</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Base Ativos</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>142</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link href="/?tenant=ufrj" style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem' }}>Acessar Workspace</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Card 2 - COPPETEC */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: 0, cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--warning)', backgroundColor: '#f59e0b' }}></div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Fundação COPPETEC</h3>
              <button onClick={() => alert('Funcionalidade de mock visual. Integração de API em desenvolvimento na próxima fase.')} style={{ color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px' }}>•••</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'monospace' }}>CNPJ: 29.432.894/0001-09</p>
            
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Repasses no Mês (Fev)</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 700 }}>R$ 412k</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Impostos Retidos (GFIP/DARF)</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 700 }}>R$ 84k</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pendências de Aprovação</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700 }}>Nenhuma</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Usuários</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>5</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Base Ativos</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>84</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link href="/?tenant=coppetec" style={{ background: 'var(--bg-surface)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem' }}>Acessar Workspace</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Card 3 - Nova unidade */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', border: '2px dashed var(--border-light)', cursor: 'pointer', background: 'transparent' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>+</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>Cadastrar Instituição</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', maxWidth: '80%', marginTop: '8px' }}>Crie um ambiente isolado para o novo convênio.</p>
        </div>

      </div>
    </div>
  );
}
