"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppState, addToast } from '@/lib/app-state';
import { useEscapeToClose } from '@/lib/use-escape-to-close';

// Tipos base para o payload e state
type ProfessionalStatus = 'ACTIVE' | 'INACTIVE';
type ProfessionalListType = {
  id: string;
  name: string;
  document: string;
  status: ProfessionalStatus;
  numDependents: number;
  tenant: { name: string };
};

export default function Autonomos() {
  const appState = useAppState();
  
  // States de Dados
  const [data, setData] = useState<ProfessionalListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // States de Filtro
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // States de UI
  const [modalType, setModalType] = useState<'CREATE' | 'DEACTIVATE' | 'REACTIVATE' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [formData, setFormData] = useState({ 
    document: '', name: '', identity: '',
    issuer: '', pisVoter: '', numDependents: 0,
    gender: '', zip: '', address: '',
    neighborhood: '', city: '', phone: '',
    mobile: '', email: '', bank: '',
    agency: '', account: '', tenantId: ''
  });
  
  useEscapeToClose(Boolean(modalType), () => setModalType(null));

  // Mapa de Tenants para ID Real (Simplificação temporária até termos endpoint de Tenants no Front)
  const tenantMap: Record<string, string> = {
    'ufrj': 'UFRJ_ID_FAKE_SEED', // Vamos ignorar mapeamento rigoroso aqui pro demo, e enviar o Role adequado
    'coppetec': 'COPPETEC_ID_FAKE'
  };

  const currentRole = appState.role === 'admin' ? 'CORP_ADMIN' 
                      : appState.role === 'auditoria' ? 'AUDITOR' 
                      : 'UNIT_OPERATOR';

  const fetchAutonomos = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:3001/professionals');
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', '8');
      if (search) url.searchParams.set('search', search);
      if (statusFilter) url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: {
          'x-tenant-id': appState.activeTenant === 'corp' ? '' : 'UFRJ_ID',
          'x-user-role': currentRole
        }
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setTotalPages(json.meta.lastPage);
        setTotalItems(json.meta.total);
      } else {
        addToast('Erro ao carregar profissionais', 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Erro de comunicação com backend', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, appState.activeTenant, currentRole]);

  useEffect(() => {
    // Debounce na busca
    const timeout = setTimeout(() => {
      fetchAutonomos();
    }, 400);
    return () => clearTimeout(timeout);
  }, [fetchAutonomos]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'CREATE') {
      try {
        const res = await fetch('http://localhost:3001/professionals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'UFRJ_ID', // Hardcoded seed param
            'x-user-role': currentRole
          },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          addToast('Profissional cadastrado!', 'success');
          fetchAutonomos();
          setModalType(null);
        } else {
          addToast(await res.text(), 'error');
        }
      } catch (e) {}
    } else if (modalType === 'DEACTIVATE' || modalType === 'REACTIVATE') {
      try {
        const status = modalType === 'DEACTIVATE' ? 'INACTIVE' : 'ACTIVE';
        const res = await fetch(`http://localhost:3001/professionals/${targetId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'UFRJ_ID',
            'x-user-role': currentRole,
            'x-user-id': 'USER_ID'
          },
          body: JSON.stringify({ status, reason })
        });
        if (res.ok) {
          addToast(`Status alterado para ${status}`, 'success');
          fetchAutonomos();
          setModalType(null);
          setReason('');
        } else {
          const err = await res.json();
          addToast(err.message, 'error');
        }
      } catch (e) {}
    }
  };

  const formatDocument = (doc: string) => {
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**');
  };

  return (
    <div className="animate-fade-in relative z-10" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gestão de Autônomos</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Cadastre profissionais, acompanhe status transacionais e audite inativações.
          </p>
        </div>
        
        {currentRole !== 'AUDITOR' && (
          <button
            onClick={() => setModalType('CREATE')}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              fontWeight: 600, 
              boxShadow: 'var(--shadow-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            <span>+</span> Novo Prestador
          </button>
        )}
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Pesquisar por nome ou CPF..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)' }}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--bg-surface)' }}
            >
              <option value="">Todos Status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(9, 30, 66, 0.02)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Profissional</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Documento</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Unidade</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // SKELETON
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', animation: 'pulse 1.5s infinite opacity' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ height: '16px', background: 'var(--border-light)', borderRadius: '4px', width: '70%', marginBottom: '8px' }}></div>
                      <div style={{ height: '12px', background: 'rgba(9, 30, 66, 0.04)', borderRadius: '4px', width: '40%' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}><div style={{ height: '16px', background: 'var(--border-light)', borderRadius: '4px', width: '100%' }}></div></td>
                    <td style={{ padding: '16px 24px' }}><div style={{ height: '20px', background: 'rgba(9, 30, 66, 0.04)', borderRadius: '12px', width: '80%' }}></div></td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}><div style={{ display: 'inline-block', height: '24px', background: 'var(--border-light)', borderRadius: '12px', width: '60px' }}></div></td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}><div style={{ display: 'inline-block', height: '24px', background: 'rgba(9, 30, 66, 0.04)', borderRadius: '4px', width: '60px' }}></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '64px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Nenhum profissional encontrado</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>Ajuste os filtros de pesquisa acima ou adicione um novo prestador para começar a realizar pagamentos.</p>
                  </td>
                </tr>
              ) : (
                data.map(prof => (
                  <tr key={prof.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prof.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{prof.numDependents} dependentes legais</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{formatDocument(prof.document)}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <span style={{ padding: '4px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {prof.tenant?.name || 'Não atribuída'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        background: prof.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(9, 30, 66, 0.04)',
                        color: prof.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)'
                      }}>
                        {prof.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {currentRole !== 'AUDITOR' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {prof.status === 'ACTIVE' ? (
                            <button
                              onClick={() => { setTargetId(prof.id); setModalType('DEACTIVATE'); }}
                              style={{ background: 'transparent', border: '1px solid rgba(222, 53, 11, 0.3)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Inativar
                            </button>
                          ) : (
                            <button
                              onClick={() => { setTargetId(prof.id); setModalType('REACTIVATE'); }}
                              style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Reativar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Mostrando <strong style={{ color: 'var(--text-main)' }}>{data.length}</strong> de <strong style={{ color: 'var(--text-main)' }}>{totalItems}</strong> registros
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '6px 16px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Anterior
                </button>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Página {page} de {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '6px 16px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {modalType && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,30,66,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ background: 'var(--bg-body)', borderRadius: '12px', width: '100%', maxWidth: modalType === 'CREATE' ? '900px' : '500px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', background: modalType === 'DEACTIVATE' ? 'rgba(222, 53, 11, 0.05)' : modalType === 'REACTIVATE' ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: modalType === 'DEACTIVATE' ? 'var(--danger)' : modalType === 'REACTIVATE' ? 'var(--success)' : 'var(--text-main)' }}>
                  {modalType === 'CREATE' ? 'Cadastro de Fornecedor' : modalType === 'DEACTIVATE' ? 'Confirmar Inativação' : 'Confirmar Reativação'}
                </h3>
                <button onClick={() => setModalType(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
            </div>

            <form onSubmit={handleAction} style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {modalType === 'CREATE' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                  
                  {/* Row 1 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>CPF: *</label>
                    <input required type="text" pattern="\d{11}" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Nome: *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Identidade:</label>
                    <input type="text" value={formData.identity} onChange={e => setFormData({...formData, identity: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Órgão Emissor:</label>
                    <input type="text" value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>PIS/PASEP/NIT: *</label>
                    <input required type="text" value={formData.pisVoter} onChange={e => setFormData({...formData, pisVoter: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Número de dependentes: *</label>
                    <input required type="number" min="0" value={formData.numDependents} onChange={e => setFormData({...formData, numDependents: Number(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Sexo: *</label>
                    <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'white' }}>
                      <option value="">--selecione--</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>CEP: *</label>
                    <input required type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Endereço: *</label>
                    <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Bairro: *</label>
                    <input required type="text" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Cidade: *</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Telefone:</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>

                  {/* Row 5 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Celular:</label>
                    <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Email:</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Banco: *</label>
                    <input required type="text" value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>

                  {/* Row 6 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Agência: *</label>
                    <input required type="text" value={formData.agency} onChange={e => setFormData({...formData, agency: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Conta: *</label>
                    <input required type="text" value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Fundação: *</label>
                    <select required value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'white' }}>
                      <option value="">--selecione--</option>
                      <option value="UFRJ_ID_FAKE_SEED">Fundação Universitária (UFRJ)</option>
                      <option value="COPPETEC_ID_FAKE">Fundação COPPETEC</option>
                    </select>
                  </div>
                </div>
              )}

              {(modalType === 'DEACTIVATE' || modalType === 'REACTIVATE') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    A alteração do status cadastral será registrada na Trilha de Auditoria do sistema (Compliance/LGPD).
                  </p>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Motivo / Parecer Obrigatório</label>
                    <textarea 
                      required minLength={10} rows={4} value={reason} onChange={e => setReason(e.target.value)} 
                      placeholder="Ex: Desligamento por solicitação do prestador. Ref. Processo SEI 1234..."
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', fontFamily: 'inherit', resize: 'vertical' }}
                    ></textarea>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: modalType === 'CREATE' ? 'flex-start' : 'flex-end', paddingTop: '16px', borderTop: modalType === 'CREATE' ? '1px solid var(--border-light)' : 'none' }}>
                {modalType === 'CREATE' ? (
                  <>
                    <button 
                      type="submit" 
                      style={{ padding: '8px 24px', background: 'var(--primary)', border: '1px solid var(--primary)', color: 'white', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Salvar
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ document: '', name: '', identity: '', issuer: '', pisVoter: '', numDependents: 0, gender: '', zip: '', address: '', neighborhood: '', city: '', phone: '', mobile: '', email: '', bank: '', agency: '', account: '', tenantId: '' })} 
                      style={{ padding: '8px 24px', background: 'white', border: '1px solid var(--border-light)', color: 'var(--text-main)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Limpar
                    </button>
                    <button type="button" onClick={() => setModalType(null)} style={{ padding: '8px 24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Fechar</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => setModalType(null)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>Cancelar</button>
                    <button 
                      type="submit" 
                      style={{ 
                        padding: '10px 16px', 
                        background: modalType === 'DEACTIVATE' ? 'var(--danger)' : 'var(--success)', 
                        border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' 
                      }}
                    >
                      Confirmar Registro
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
