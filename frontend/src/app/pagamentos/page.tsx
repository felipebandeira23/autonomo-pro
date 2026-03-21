"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const mockPayments = [
  { id: '1042', ident: '#RPA-1042', nome: 'Eduardo Raupp de Vargas', convenio: 'Pós-Graduação UFRJ', bruto: 'R$ 4.533,43', descontos: '- R$ 1.092,30', statusId: 'pago', statusBadge: 'Pago ✅', statusStyle: 'rgba(16, 185, 129, 0.1)', statusColor: 'var(--success)' },
  { id: '1043', ident: '#RPA-1043', nome: 'Debora Alves dos Santos', convenio: 'Auditoria Independente', bruto: 'R$ 18.250,00', descontos: '- R$ 2.455,10', statusId: 'aprovacao', statusBadge: 'Aprovação Financeira ⭐', statusStyle: 'rgba(245, 158, 11, 0.1)', statusColor: '#d97706' },
  { id: '1044', ident: '#RPA-1044', nome: 'Joao Carlos da Silva', convenio: 'Consultoria Acadêmica', bruto: 'R$ 2.500,00', descontos: '--', statusId: 'elaboracao', statusBadge: 'Em Elaboração ✍️', statusStyle: 'rgba(9, 30, 66, 0.1)', statusColor: 'var(--text-main)' }
];

export default function Pagamentos() {
   const [tab, setTab] = useState('todos');
   const [search, setSearch] = useState('');
   const [isSearching, setIsSearching] = useState(false);
   const [modalContent, setModalContent] = useState<string | null>(null);

   useEffect(() => {
     setIsSearching(true);
     const timer = setTimeout(() => setIsSearching(false), 400); 
     return () => clearTimeout(timer);
   }, [search, tab]);

   const filtered = mockPayments.filter(p => {
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.ident.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (tab === 'elaboracao') return p.statusId === 'elaboracao';
      if (tab === 'aprovacao') return p.statusId === 'aprovacao';
      if (tab === 'pagos') return p.statusId === 'pago';
      return true;
   });

   const countElaboracao = mockPayments.filter(p => p.statusId === 'elaboracao').length;
   const countAprovacao = mockPayments.filter(p => p.statusId === 'aprovacao').length;

  return (
    <div className="animate-fade-in relative">

      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="animate-fade-in" style={{ background: 'var(--bg-body)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
                 <button onClick={() => setModalContent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              {modalContent === 'Lançar Lote via Excel' ? (
                  <div style={{ marginBottom: '24px' }}>
                     <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>Arquivo Lote RPA (.xlsx / .csv)</label>
                     <input type="file" accept=".csv, .xlsx, .xls" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px dashed var(--border-light)', cursor: 'pointer' }} />
                  </div>
              ) : (
                  <div style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Nenhum contrato ativo pendente de aprovação prévia da auditoria nesta competência.</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Voltar</button>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Avançar Operação</button>
              </div>
           </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Esteira de Pagamentos</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Fluxo de aprovação em camadas, retenção automática da fonte e RPAs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setModalContent('Contratos Globais Ativos')} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span>⚙️</span> Contratos / Projetos
          </button>
          <button onClick={() => setModalContent('Lançar Lote via Excel')} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
            <span>+</span> Lançar Lote
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
        <div onClick={() => setTab('todos')} style={{ paddingBottom: '12px', borderBottom: tab === 'todos' ? '3px solid var(--primary)' : '3px solid transparent', color: tab === 'todos' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Todos Lançamentos</div>
        <div onClick={() => setTab('elaboracao')} style={{ paddingBottom: '12px', borderBottom: tab === 'elaboracao' ? '3px solid var(--primary)' : '3px solid transparent', color: tab === 'elaboracao' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer' }}>Em Elaboração <span style={{ background: 'var(--border-light)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>{countElaboracao}</span></div>
        <div onClick={() => setTab('aprovacao')} style={{ paddingBottom: '12px', borderBottom: tab === 'aprovacao' ? '3px solid var(--primary)' : '3px solid transparent', color: tab === 'aprovacao' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer' }}>Em Aprovação <span style={{ background: 'var(--warning)', backgroundColor: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>{countAprovacao}</span></div>
        <div onClick={() => setTab('pagos')} style={{ paddingBottom: '12px', borderBottom: tab === 'pagos' ? '3px solid var(--primary)' : '3px solid transparent', color: tab === 'pagos' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer' }}>Pagos / Liberados</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por favorecido, CPF ou código..." style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', outline: 'none' }} />
            {isSearching && <div style={{ position: 'absolute', right: '16px', top: '10px', fontSize: '1.2rem', animation: 'spin 1s linear infinite' }}>⏳</div>}
        </div>
        <select style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'white', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>Ref: Fevereiro/2026</option>
        </select>
        <select style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'white', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>Todas Unidades</option>
        </select>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', opacity: isSearching ? 0.3 : 1, transition: 'opacity 0.2s' }}>
          <thead>
            <tr style={{ background: 'rgba(9, 30, 66, 0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Identificador</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Favorecido / Convênio</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Valor Bruto</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Deduções (IR/INSS)</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Status / Camada</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="hover-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--primary)' }}>{p.ident}</td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Convênio: {p.convenio}</div>
                </td>
                <td style={{ padding: '18px 24px', color: 'var(--text-main)', fontWeight: 600, textAlign: 'right' }}>{p.bruto}</td>
                <td style={{ padding: '18px 24px', color: 'var(--danger)', fontWeight: 600, textAlign: 'right' }}>{p.descontos}</td>
                <td style={{ padding: '18px 24px' }}>
                  <span style={{ background: p.statusStyle, color: p.statusColor, padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{p.statusBadge}</span>
                </td>
                <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                  <Link href={`/pagamentos/${p.ident.replace('#', '')}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>Analisar</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
               <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum pagamento encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
