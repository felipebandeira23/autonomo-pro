"use client";
import React, { useState } from 'react';

const mockDB = [
  { id: 1, nome: "Eduardo Raupp de Vargas", cpf: "***.341.22*-**", dep: 1, repasse: "R$ 14.599,23", status: 'Ativo' },
  { id: 2, nome: "Cláudia Affonso Silva Araújo", cpf: "***.112.55*-**", dep: 0, repasse: "R$ 5.967,49", status: 'Ativo' },
  { id: 3, nome: "Adriana Aparecida Marques", cpf: "***.892.11*-**", dep: 2, repasse: "R$ 4.124,24", status: 'Ativo' },
  { id: 4, nome: "Joao Carlos da Silva", cpf: "***.123.45*-**", dep: 0, repasse: "R$ 2.500,00", status: 'Inativo' },
  { id: 5, nome: "Maria Joana de Souza", cpf: "***.567.89*-**", dep: 1, repasse: "R$ 1.200,00", status: 'Ativo' },
];

export default function Autonomos() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [localDB, setLocalDB] = useState(mockDB);
  const [modalContent, setModalContent] = useState<string | null>(null);
  
  const filteredDB = localDB.filter(item => 
    item.nome.toLowerCase().includes(search.toLowerCase()) || 
    item.cpf.includes(search) || 
    item.status.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredDB.length / itemsPerPage);
  const currentItems = filteredDB.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja inativar este profissional temporariamente da base?')) {
        setLocalDB(localDB.map(i => i.id === id ? { ...i, status: 'Inativo' } : i));
    }
  };

  return (
    <div className="animate-fade-in relative">
      
      {/* Modal CRUD Interface */}
      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="animate-fade-in" style={{ background: 'var(--bg-body)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
                 <button onClick={() => setModalContent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                 <input type="text" placeholder="Nome Completo / Razão Social" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                 <input type="text" placeholder="Documento (CPF / CNPJ)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
                 <input type="number" placeholder="Número de Dependentes Legais" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Descartar</button>
                 <button onClick={() => setModalContent(null)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Confirmar Dados</button>
              </div>
           </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gestão de Autônomos</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Cadastre os profissionais, informações de INSS de outras fontes e deduções legais para processar o IRRF.</p>
        </div>
        <button onClick={() => setModalContent('Cadastrar Novo Prestador')} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
          <span>+</span> Novo Prestador
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input 
          type="text" 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar profissional por nome, CPF ou status..." 
          style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', outline: 'none' }} 
        />
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(9, 30, 66, 0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Nome Completo</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Documento (CPF)</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Dependentes</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Repasses (2026)</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.id} className="hover-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.nome}
                  {item.status === 'Inativo' && <span style={{ marginLeft: '8px', background: 'var(--border-light)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>Inativo</span>}
                </td>
                <td style={{ padding: '18px 24px', color: 'var(--text-muted)' }}>{item.cpf}</td>
                <td style={{ padding: '18px 24px' }}>{item.dep}</td>
                <td style={{ padding: '18px 24px', color: 'var(--success)', fontWeight: 500 }}>{item.repasse}</td>
                <td style={{ padding: '18px 24px' }}>
                  <button onClick={() => setModalContent(`Editando: ${item.nome}`)} style={{ color: 'var(--secondary)', fontWeight: 600, marginRight: '16px', fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Desativar</button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
               <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum autônomo encontrado com a busca atual.</td></tr>
            )}
          </tbody>
        </table>
        
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Página {Math.max(1, page)} de {Math.max(1, totalPages)} (Mostrando {filteredDB.length} registros)</span>
          <div>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', marginRight: '8px', background: 'var(--bg-surface)', cursor: 'pointer' }}>Anterior</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', background: 'var(--bg-surface)', cursor: 'pointer' }}>Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
}
