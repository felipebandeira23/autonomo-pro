"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDerivedTenantMetrics, useAppState } from '@/lib/app-state';

export default function Sidebar() {
  const pathname = usePathname();
  const appState = useAppState();
  const metrics = getDerivedTenantMetrics(appState);

  return (
    <aside className="sidebar-shell">
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
        
        <Link href="/" className={`sidebar-link ${pathname === '/' ? 'sidebar-link-active' : ''}`}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>📊</span> Indicadores
        </Link>
        <Link href="/autonomos" className={`sidebar-link ${pathname === '/autonomos' ? 'sidebar-link-active' : ''}`}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>🧑‍🏫</span> Autônomos
        </Link>
        <Link href="/pagamentos" className={`sidebar-link ${pathname?.startsWith('/pagamentos') ? 'sidebar-link-active' : ''}`}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>💸</span> Pagamentos
        </Link>

        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px', marginTop: '32px', paddingLeft: '8px' }}>Gestão</div>
        <Link href="/configuracoes" className={`sidebar-link ${pathname === '/configuracoes' ? 'sidebar-link-active' : ''}`}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>⚙️</span> Engenharia Tributária
        </Link>
        <Link href="/tenants" className={`sidebar-link ${pathname === '/tenants' ? 'sidebar-link-active' : ''}`}>
          <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>🏢</span> Unidades Gestoras
          {metrics.totalCriticalAlerts > 0 && (
            <span style={{
              marginLeft: 'auto',
              minWidth: '24px',
              height: '24px',
              padding: '0 8px',
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.18)',
              color: '#fecaca',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {metrics.totalCriticalAlerts}
            </span>
          )}
        </Link>
      </nav>
      
      <div style={{ padding: '24px', borderTop: '1px solid var(--border-dark)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Versão 1.0.0 (Corp)
      </div>
    </aside>
  );
}
