import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-dark)',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px', 
        borderBottom: '1px solid var(--border-dark)',
        background: 'linear-gradient(90deg, var(--bg-sidebar) 0%, rgba(9, 30, 66, 0.8) 100%)'
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent), var(--secondary))',
          marginRight: '12px',
          boxShadow: '0 0 15px rgba(0, 184, 217, 0.4)'
        }}></div>
        <h1 style={{ color: 'var(--text-inverse)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>AutônomoPro</h1>
      </div>

      <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px', paddingLeft: '8px' }}>Dashboard</div>
        
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', padding: '10px 12px', 
          borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)',
          color: 'var(--text-sidebar-active)', fontWeight: 500
        }}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>📊</span> Indicadores
        </Link>
        <Link href="/autonomos" style={{
          display: 'flex', alignItems: 'center', padding: '10px 12px', 
          borderRadius: '8px', color: 'var(--text-sidebar)', fontWeight: 500, transition: 'background 0.2s'
        }}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>🧑‍🏫</span> Autônomos
        </Link>
        <Link href="/pagamentos" style={{
          display: 'flex', alignItems: 'center', padding: '10px 12px', 
          borderRadius: '8px', color: 'var(--text-sidebar)', fontWeight: 500, transition: 'background 0.2s'
        }}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>💸</span> Pagamentos
        </Link>

        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px', marginTop: '32px', paddingLeft: '8px' }}>Gestão</div>
        <Link href="/configuracoes" style={{
          display: 'flex', alignItems: 'center', padding: '10px 12px', 
          borderRadius: '8px', color: 'var(--text-sidebar)', fontWeight: 500, transition: 'background 0.2s'
        }}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>⚙️</span> Engenharia Tributária
        </Link>
        <Link href="/tenants" style={{
          display: 'flex', alignItems: 'center', padding: '10px 12px', 
          borderRadius: '8px', color: 'var(--text-sidebar)', fontWeight: 500, transition: 'background 0.2s'
        }}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>🏢</span> Unidades Gestoras
        </Link>
      </nav>
      
      <div style={{ padding: '24px', borderTop: '1px solid var(--border-dark)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Versão 1.0.0 (Corp)
      </div>
    </aside>
  );
}
