"use client";

import React, { useState } from 'react';
import { useEscapeToClose } from '@/lib/use-escape-to-close';

const mockDB = [
  { id: 1, nome: 'Eduardo Raupp de Vargas', cpf: '***.341.22*-**', dep: 1, repasse: 'R$ 14.599,23', status: 'Ativo' },
  { id: 2, nome: 'Claudia Affonso Silva Araujo', cpf: '***.112.55*-**', dep: 0, repasse: 'R$ 5.967,49', status: 'Ativo' },
  { id: 3, nome: 'Adriana Aparecida Marques', cpf: '***.892.11*-**', dep: 2, repasse: 'R$ 4.124,24', status: 'Ativo' },
  { id: 4, nome: 'Joao Carlos da Silva', cpf: '***.123.45*-**', dep: 0, repasse: 'R$ 2.500,00', status: 'Inativo' },
  { id: 5, nome: 'Maria Joana de Souza', cpf: '***.567.89*-**', dep: 1, repasse: 'R$ 1.200,00', status: 'Ativo' },
];

export default function Autonomos() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [localDB, setLocalDB] = useState(mockDB);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ nome: '', cpf: '', dep: '0' });
  useEscapeToClose(Boolean(modalContent), () => setModalContent(null));

  const filteredDB = localDB.filter(
    (item) =>
      item.nome.toLowerCase().includes(search.toLowerCase()) ||
      item.cpf.includes(search) ||
      item.status.toLowerCase().includes(search.toLowerCase()),
  );

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(filteredDB.length / itemsPerPage));
  const currentItems = filteredDB.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja inativar este profissional temporariamente da base?')) {
      setLocalDB(localDB.map((item) => (item.id === id ? { ...item, status: 'Inativo' } : item)));
      showToast('Prestador marcado como inativo.');
    }
  };

  const openCreateModal = () => {
    setFormData({ nome: '', cpf: '', dep: '0' });
    setFormError('');
    setModalContent('Cadastrar Novo Prestador');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.nome.trim() || !formData.cpf.trim()) {
      setFormError('Preencha nome e documento antes de confirmar.');
      return;
    }

    if (modalContent === 'Cadastrar Novo Prestador') {
      setLocalDB((current) => [
        {
          id: current.length + 1,
          nome: formData.nome,
          cpf: formData.cpf,
          dep: Number(formData.dep || 0),
          repasse: 'R$ 0,00',
          status: 'Ativo',
        },
        ...current,
      ]);
      showToast('Novo prestador cadastrado no mock.');
    } else {
      showToast('Dados do prestador atualizados no mock.');
    }

    setModalContent(null);
    setFormData({ nome: '', cpf: '', dep: '0' });
    setFormError('');
    setPage(1);
  };

  return (
    <div className="animate-fade-in relative">
      {modalContent && (
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{modalContent}</h3>
              <button
                onClick={() => setModalContent(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <input
                  required
                  type="text"
                  value={formData.nome}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, nome: event.target.value }));
                    if (formError) {
                      setFormError('');
                    }
                  }}
                  placeholder="Nome Completo / Razao Social"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
                />
                <input
                  required
                  type="text"
                  value={formData.cpf}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, cpf: event.target.value }));
                    if (formError) {
                      setFormError('');
                    }
                  }}
                  placeholder="Documento (CPF / CNPJ)"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
                />
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.dep}
                  onChange={(event) => setFormData((current) => ({ ...current, dep: event.target.value }))}
                  placeholder="Numero de Dependentes Legais"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
                />
                {formError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{formError}</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalContent(null)}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirmar Dados
                </button>
              </div>
            </form>
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
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gestao de Autonomos</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Cadastre os profissionais, informacoes de INSS de outras fontes e deducoes legais para processar o IRRF.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
        >
          <span>+</span> Novo Prestador
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar profissional por nome, CPF ou status..."
          style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', outline: 'none' }}
        />
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: 'rgba(9, 30, 66, 0.02)' }}>
              <th style={{ minWidth: '260px', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Nome Completo</th>
              <th style={{ minWidth: '180px', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Documento (CPF)</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Dependentes</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Repasses (2026)</th>
              <th style={{ width: '180px', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="hover-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.nome}
                  {item.status === 'Inativo' && (
                    <span style={{ marginLeft: '8px', background: 'var(--border-light)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                      Inativo
                    </span>
                  )}
                </td>
                <td style={{ padding: '18px 24px', color: 'var(--text-muted)' }}>{item.cpf}</td>
                <td style={{ padding: '18px 24px' }}>{item.dep}</td>
                <td style={{ padding: '18px 24px', color: 'var(--success)', fontWeight: 500 }}>{item.repasse}</td>
                <td style={{ padding: '18px 24px', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => {
                      setModalContent(`Editando: ${item.nome}`);
                      setFormData({ nome: item.nome, cpf: item.cpf, dep: String(item.dep) });
                    }}
                    style={{ color: 'var(--secondary)', fontWeight: 600, marginRight: '16px', fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    Desativar
                  </button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum autonomo encontrado com a busca atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Pagina {Math.max(1, page)} de {totalPages} (Mostrando {filteredDB.length} registros)
          </span>
          <div>
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', marginRight: '8px', background: 'var(--bg-surface)', cursor: 'pointer' }}>
              Anterior
            </button>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', background: 'var(--bg-surface)', cursor: 'pointer' }}>
              Proxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
