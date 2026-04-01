"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppState, addToast } from '@/lib/app-state';
import { getPaymentByCode, getPaymentStatusMeta } from '@/lib/mock-data';

export default function DetalhePagamento() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const idStr = rawId || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulando um fetch pro backend
    setTimeout(() => {
      const record = getPaymentByCode(idStr);
      setData(record);
      setLoading(false);
    }, 400);
  }, [idStr]);

  if (loading) return <div className="p-10 text-center text-slate-500">Buscando memória de cálculo...</div>;

  if (!data) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-slate-800">Recibo não encontrado</h2>
      <button onClick={() => router.push('/pagamentos')} className="mt-4 px-4 py-2 bg-slate-100 rounded">Voltar</button>
    </div>
  );

  const statusMeta = getPaymentStatusMeta(data.statusId);

  return (
    <div className="animate-fade-in relative max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => router.push('/pagamentos')} className="text-sm font-semibold text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1">
            &larr; Voltar para a Fila
          </button>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Recibo #{idStr}</h2>
          <p className="text-slate-500 mt-1">Competência: {data.referencia} • Emissão: {data.data}</p>
        </div>
        <div>
          <span
            style={{
              background: statusMeta.style,
              color: statusMeta.color,
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {statusMeta.detailBadge}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Dados do Favorecido</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nome do Profissional</p>
                <p className="font-medium text-slate-800">{data.nome}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Documento Físico</p>
                <p className="font-medium text-slate-800">{data.cpf}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Vínculo/Convênio</p>
                <p className="font-medium text-slate-800">{data.convenio}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status Cadastral</p>
                <p className="font-medium text-emerald-600">Ativo Validado</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Memória de Cálculo (Lógica de Retenção)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">Valor Bruto do Repasse</span>
                <span className="font-bold text-slate-800">{data.bruto}</span>
              </div>
              
              <div className="pl-4 border-l-2 border-orange-200 py-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">(-) INSS Retido na Fonte</span>
                  <span className="font-bold text-rose-600">R$ {data.deducaoinss}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  11% sobre o Bruto. {parseFloat(data.deducaoinss?.replace(',', '.') || '0') >= 932.32 ? 'Teto de Contribuição atingido.' : 'Abaixo do teto máximo.'}
                </p>
              </div>

              <div className="pl-4 border-l-2 border-orange-200 py-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">(-) Imposto de Renda (IRRF)</span>
                  <span className="font-bold text-rose-600">R$ {data.deducoirrf}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Base de Cálculo = Bruto - INSS - Dependentes. Tabela Progressiva aplicada automaticamente.
                </p>
              </div>

              <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-lg mt-4">
                <span className="text-slate-800 font-bold uppercase tracking-wide text-sm">Valor Líquido a Pagar</span>
                <span className="font-extrabold text-emerald-600 text-lg">{data.liquido}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Trilha de Auditoria</h3>
            <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
              <div className="relative">
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[1.35rem] top-1"></div>
                <p className="text-sm font-bold text-slate-800">Cálculo Gerado</p>
                <p className="text-xs text-slate-500 border-b border-slate-200 pb-2 mb-2">Pelo Motor de Impostos (Sistema)</p>
              </div>
              <div className="relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[1.35rem] top-1"></div>
                <p className="text-sm font-bold text-slate-800">Enviado para Elaboração</p>
                <p className="text-xs text-slate-500 border-b border-slate-200 pb-2 mb-2">Por Operador do Convênio</p>
              </div>
              {data.statusId !== 'elaboracao' && (
                <div className="relative">
                  <div className={`absolute w-3 h-3 ${data.statusId === 'pago' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full -left-[1.35rem] top-1`}></div>
                  <p className="text-sm font-bold text-slate-800">
                    {data.statusId === 'aprovacao' ? 'Aprovação Pendente' : 'RPA Finalizada / Paga'}
                  </p>
                  <p className="text-xs text-slate-500">Gestor Administrativo</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Ações Contextuais</h3>
            <div className="space-y-3">
              <button 
                onClick={() => { addToast('Recibo PDF exportado com sucesso', 'success') }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors text-sm"
              >
                📥 Baixar RPA em PDF
              </button>
              
              {data.statusId === 'elaboracao' && (
                <button 
                  onClick={() => { addToast('Submetido para aprovação da chefia', 'success'); router.push('/pagamentos') }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  🚀 Submeter para Aprovação
                </button>
              )}

              {data.statusId === 'aprovacao' && (
                <>
                  <button 
                    onClick={() => { addToast('Pagamento Liberado na Instituição', 'success'); router.push('/pagamentos') }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    ✅ Aprovar Operação
                  </button>
                  <button 
                    onClick={() => { addToast('Lote de pagamento rejeitado', 'info'); router.push('/pagamentos') }}
                    className="w-full py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-lg transition-colors text-sm"
                  >
                    ❌ Devolver para Correção
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
