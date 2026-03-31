"use client";
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState, setRole, setActiveTenant, type UserRole } from '@/lib/app-state';

function TopBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, activeTenant } = useAppState();

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveTenant(val);
  };

  return (
    <header className="top-header">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem', cursor: 'pointer' }}>Corp</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.875rem' }}>Workspace Principal</span>
        </div>
      </div>
      <div className="topbar-right">
        <select className="topbar-tenant-select" value={activeTenant} onChange={handleTenantChange} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-main)', fontWeight: 500, outline: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
          <option value="corp">Visão: Admin Corporativo</option>
          <option value="ufrj">Visão: UFRJ (Unidade)</option>
          <option value="coppetec">Visão: COPPETEC (Fundação)</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-main)', fontWeight: 500, outline: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
          <option value="admin">Perfil: Sistema (Admin)</option>
          <option value="financeiro">Perfil: Operação (Financeiro)</option>
          <option value="auditoria">Perfil: Leitura (Auditoria)</option>
        </select>
        <div className="topbar-user">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>Felipe (Admin)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>felipe@ufrj.br</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }} />
        </div>
      </div>
    </header>
  );
}

export default function TopBar() {
  return (
    <Suspense fallback={<header className="top-header">Carregando...</header>}>
      <TopBarContent />
    </Suspense>
  );
}
