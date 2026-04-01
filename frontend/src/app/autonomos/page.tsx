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
  const [formData, setFormData] = useState({ name: '', document: '', numDependents: 0 });
  
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
    // Mascara LGPD basica de CPF
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**');
  };

  return (
    <div className="animate-fade-in relative min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Autônomos</h2>
          <p className="text-slate-500 mt-2">
            Cadastre profissionais, acompanhe status transacionais e audite inativações.
          </p>
        </div>
        
        {currentRole !== 'AUDITOR' && (
          <button
            onClick={() => setModalType('CREATE')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all focus:ring-4 focus:ring-indigo-100 flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Novo Prestador
          </button>
        )}
      </div>

      {/* FILTER BAR SECTION */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="flex-1 w-full relative">
          <svg className="absolute left-3 top-3 text-slate-400" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Pesquisar por nome ou CPF..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
          />
        </div>
        <div className="w-full md:w-auto">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full md:w-48 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Todos Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Profissional', 'Documento', 'Unidade', 'Status', 'Ações'].map(col => (
                    <th key={col} className={`py-4 px-6 text-sm font-semibold text-slate-600 ${col === 'Status' ? 'text-center' : col === 'Ações' ? 'text-right' : ''}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-full"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="py-4 px-6 text-center"><div className="inline-block h-6 bg-slate-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-6 text-right"><div className="inline-block h-6 bg-slate-200 rounded w-16"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <h3 className="text-lg font-medium text-slate-900">Nenhum profissional encontrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Ajuste os filtros de pesquisa acima ou adicione um novo prestador para começar a realizar pagamentos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Profissional</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Documento</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Unidade</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-center">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((prof) => (
                  <tr key={prof.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{prof.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{prof.numDependents} dependentes legais</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-sm">{formatDocument(prof.document)}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {prof.tenant?.name || 'Não atribuída'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${prof.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {prof.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {currentRole !== 'AUDITOR' && (
                        <div className="flex items-center justify-end gap-2">
                          {prof.status === 'ACTIVE' ? (
                            <button
                              onClick={() => { setTargetId(prof.id); setModalType('DEACTIVATE'); }}
                              className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-md transition-colors"
                              title={`Inativar Cadastro de ${prof.name}`}
                              aria-label={`Inativar Cadastro de ${prof.name}`}
                            >
                              Inativar
                            </button>
                          ) : (
                            <button
                              onClick={() => { setTargetId(prof.id); setModalType('REACTIVATE'); }}
                              className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
                              title={`Reativar Cadastro de ${prof.name}`}
                              aria-label={`Reativar Cadastro de ${prof.name}`}
                            >
                              Reativar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Info */}
        {!loading && totalPages > 0 && (
          <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-white text-sm">
            <span className="text-slate-500">
              Mostrando <span className="font-medium text-slate-900">{data.length}</span> de <span className="font-medium text-slate-900">{totalItems}</span> registros
            </span>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-md disabled:opacity-50 disabled:bg-slate-50 hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                >
                  Anterior
                </button>
                <div className="px-3 py-1.5 font-medium text-slate-700">Página {page} de {totalPages}</div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-slate-200 rounded-md disabled:opacity-50 disabled:bg-slate-50 hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS TRANSACIONAIS */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            
            <div className={`p-6 border-b ${modalType === 'DEACTIVATE' ? 'border-rose-100 bg-rose-50/50' : modalType === 'REACTIVATE' ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${modalType === 'DEACTIVATE' ? 'text-rose-800' : modalType === 'REACTIVATE' ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {modalType === 'CREATE' ? 'Cadastrar Prestador' : 
                   modalType === 'DEACTIVATE' ? 'Confirmar Inativação' : 'Confirmar Reativação'}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAction} className="p-6">
              {modalType === 'CREATE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="João da Silva" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Documento (CPF)</label>
                    <input required type="text" pattern="\d{11}" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Apenas números (11 dígitos)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dependentes Legais</label>
                    <input required type="number" min="0" value={formData.numDependents} onChange={e => setFormData({...formData, numDependents: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              )}

              {(modalType === 'DEACTIVATE' || modalType === 'REACTIVATE') && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    A alteração do status cadastral será registrada na Trilha de Auditoria do sistema (Compliance/LGPD).
                  </p>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Motivo / Parecer Obrigatório</label>
                    <textarea 
                      required 
                      minLength={10}
                      rows={4}
                      value={reason} 
                      onChange={e => setReason(e.target.value)} 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" 
                      placeholder="Ex: Desligamento por solicitação do prestador. Ref. Processo SEI 1234..."
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  className={`px-4 py-2 font-medium text-white rounded-lg transition-colors shadow-sm ${
                    modalType === 'DEACTIVATE' ? 'bg-rose-600 hover:bg-rose-700' : 
                    modalType === 'REACTIVATE' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                    'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {modalType === 'CREATE' ? 'Finalizar Cadastro' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
