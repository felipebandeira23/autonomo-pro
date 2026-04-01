"use client";

import { useSyncExternalStore, useState, useEffect } from 'react';
import { paymentRecords, tenantSummaries, irrfBrackets, mockAutonomos } from '@/lib/mock-data';
import type { PaymentRecord, PaymentStatus, AutonomoRecord } from '@/lib/mock-data';

const STORAGE_KEY = 'autonomo-pro.app-state';

export type UserRole = 'admin' | 'financeiro' | 'auditoria';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  targetId: string;
  action: string;
  userRole: UserRole;
  details: string;
}

type AppState = {
  paymentStatusOverrides: Partial<Record<string, PaymentStatus>>;
  role: UserRole;
  toasts: ToastMessage[];
  autonomos: AutonomoRecord[];
  irrfBrackets: typeof irrfBrackets;
  tenants: typeof tenantSummaries;
  paymentRecords: PaymentRecord[];
  auditLogs: AuditLog[];
  activeTenant: string;
  isLoggedIn: boolean;
  /** YYYY-MM — referência ativa no dashboard */
  dashboardReferencia: string;
};

const defaultState: AppState = {
  paymentStatusOverrides: {},
  role: 'admin',
  toasts: [],
  autonomos: mockAutonomos,
  irrfBrackets: irrfBrackets,
  tenants: tenantSummaries,
  paymentRecords: paymentRecords,
  auditLogs: [],
  activeTenant: 'corp',
  isLoggedIn: false,
  dashboardReferencia: '2026-02',
};

let state: AppState = defaultState;
const listeners = new Set<() => void>();
let hydrated = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function hydrateState() {
  if (hydrated || typeof window === 'undefined') {
    return;
  }

  hydrated = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      state = { ...defaultState, ...JSON.parse(stored) };
    }
  } catch {
    state = defaultState;
  }
}

function persistState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function subscribeToAppState(listener: () => void) {
  hydrateState();
  listeners.add(listener);

  if (typeof window !== 'undefined') {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        hydrated = false;
        hydrateState();
        notify();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  }

  return () => {
    listeners.delete(listener);
  };
}

export function getAppStateSnapshot() {
  hydrateState();
  return state;
}

function getServerAppStateSnapshot() {
  return defaultState;
}

export function updatePaymentStatus(paymentCode: string, status: PaymentStatus) {
  hydrateState();
  
  const oldStatus = state.paymentStatusOverrides[paymentCode] || 'elaboracao';
  
  state = {
    ...state,
    paymentStatusOverrides: {
      ...state.paymentStatusOverrides,
      [paymentCode]: status,
    },
  };
  
  addAuditLog(
    `#RPA-${paymentCode}`,
    `Alteração de Status`,
    `Status alterado de "${oldStatus}" para "${status}".`
  );
  
  persistState();
  notify();
}

export function resetAppState() {
  state = defaultState;
  persistState();
  notify();
}

export function setRole(role: UserRole) {
  state = { ...state, role };
  persistState();
  notify();
}

export function setActiveTenant(tenant: string) {
  state = { ...state, activeTenant: tenant };
  persistState();
  notify();
}

export function setLoggedIn(status: boolean) {
  state = { ...state, isLoggedIn: status };
  persistState();
  notify();
}

export function addAuditLog(targetId: string, action: string, details: string) {
  const log: AuditLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    targetId,
    action,
    userRole: state.role,
    details,
  };
  state = {
    ...state,
    auditLogs: [log, ...state.auditLogs],
  };
  persistState();
  notify();
}

export function saveBrackets(newBrackets: typeof irrfBrackets) {
  state = { ...state, irrfBrackets: newBrackets };
  persistState();
  notify();
}

export function createAutonomo(autonomo: Omit<AutonomoRecord, 'id'>) {
  const newId = Math.max(...state.autonomos.map((a) => a.id), 0) + 1;
  state = {
    ...state,
    autonomos: [...state.autonomos, { ...autonomo, id: newId }],
  };
  persistState();
  notify();
}

export function toggleAutonomoStatus(id: number, status: AutonomoRecord['status']) {
  state = {
    ...state,
    autonomos: state.autonomos.map((a) => (a.id === id ? { ...a, status } : a)),
  };
  persistState();
  notify();
}

export function createTenant(tenantId: string, label: string, cnpj: string) {
  const newTenant = {
    id: tenantId,
    label,
    ativos: 0,
    repasses: 'R$ 0,00',
    retidos: 'R$ 0,00',
    status: 'Sincronizado' as const,
    usuarios: 1,
    baseAtivos: 0,
    cnpj,
    repassesMes: 'R$ 0,00',
    impostosMes: 'R$ 0,00',
    pendencias: 'Nenhuma',
    pendenciasCriticas: false,
  };
  
  state = {
    ...state,
    tenants: {
      ...state.tenants,
      [tenantId]: newTenant,
    },
  };
  persistState();
  notify();
}

export function updateTenant(tenantId: string, updates: Partial<typeof tenantSummaries.ufrj>) {
  if (!state.tenants[tenantId as keyof typeof tenantSummaries]) return;
  
  state = {
    ...state,
    tenants: {
      ...state.tenants,
      [tenantId]: {
        ...state.tenants[tenantId as keyof typeof tenantSummaries],
        ...updates
      }
    }
  };
  persistState();
  notify();
}

export function addToast(message: string, type: ToastMessage['type'] = 'info') {
  const id = Math.random().toString(36).substring(2, 9);
  state = {
    ...state,
    toasts: [...state.toasts, { id, message, type }],
  };
  notify();

  setTimeout(() => {
    state = {
      ...state,
      toasts: state.toasts.filter((t) => t.id !== id),
    };
    notify();
  }, 4000);
}

export function useAppState() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const storeState = useSyncExternalStore(subscribeToAppState, getAppStateSnapshot, getServerAppStateSnapshot);

  if (!isClient) {
    return getServerAppStateSnapshot();
  }

  return storeState;
}

export function getEffectivePayment(payment: PaymentRecord, appState: AppState): PaymentRecord {
  const paymentCode = payment.ident.replace('#', '');
  const overrideStatus = appState.paymentStatusOverrides[paymentCode];

  if (!overrideStatus) {
    return payment;
  }

  return {
    ...payment,
    statusId: overrideStatus,
  };
}

export function getEffectivePayments(appState: AppState, respectContext = true) {
  let mapped = appState.paymentRecords.map((payment) => getEffectivePayment(payment, appState));
  if (respectContext && appState.activeTenant !== 'corp') {
     mapped = mapped.filter(p => p.tenantId === appState.activeTenant);
  }
  return mapped;
}

function parseCurrency(str: string): number {
  if (!str || typeof str !== 'string') return 0;
  // Remove o prefixo 'R$', pontos (separador de milhar) e substitui vírgula por ponto decimal
  const cleaned = str.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Formata moeda de forma segura — nunca retorna 'R$ NaN' */
export function formatSafeCurrency(val: unknown): string {
  const n = Number(val);
  if (!Number.isFinite(n)) return 'Indisponível';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

/** Contrato tipado do dashboard executivo */
export interface DashboardMetrics {
  referencia: string;
  autonomosAtivos: number;
  variacaoAutonomosMes: number;
  valorBrutoRepassado: number;
  valorBrutoRepassadoStr: string;
  impostosRetidos: number;
  impostosRetidosStr: string;
  totalGuiasPendentes: number;
  lancamentosEmAnalise: number;
  historicoRecente: PaymentRecord[];
  geradoEm: string;
  syncStatus: 'ok' | 'atrasado' | 'erro';
}

export function getDashboardMetrics(appState: AppState, referencia?: string): DashboardMetrics {
  const ref = referencia ?? appState.dashboardReferencia ?? '2026-02';
  const allPayments = appState.paymentRecords.map((p) => getEffectivePayment(p, appState));

  // Filtro por tenant
  const tenantPayments = appState.activeTenant !== 'corp'
    ? allPayments.filter(p => p.tenantId === appState.activeTenant)
    : allPayments;

  // Pagamentos da referência atual
  const refPayments = tenantPayments.filter(p => p.referencia === ref);

  // Pagamentos do mês anterior para delta
  const [year, month] = ref.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevRef = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  const prevPayments = tenantPayments.filter(p => p.referencia === prevRef);

  // Autônomos ativos (filtro por tenant se não corporativo)
  const autonomosAtivos = appState.activeTenant !== 'corp'
    ? appState.autonomos.filter(a => a.tenant.toLowerCase() === appState.activeTenant && a.status === 'Ativo').length
    : appState.autonomos.filter(a => a.status === 'Ativo').length;

  const autonomosPrevAtivos = autonomosAtivos; // sem dados históricos reais, delta = 0

  // Agregações financeiras da referência
  const valorBrutoRepassado = refPayments.reduce((acc, p) => acc + parseCurrency(p.bruto), 0);
  const impostosRetidos = refPayments.reduce((acc, p) => acc + parseCurrency(p.descontos), 0);

  // Pendentes: não estão em 'pago'
  const pendentes = tenantPayments.filter(p => p.statusId !== 'pago' && p.statusId !== 'elaboracao');
  const emAnalise = tenantPayments.filter(p => p.statusId === 'aprovacao').length;

  // Para o alerta UFRJ
  const showUfrjGuides = appState.activeTenant === 'corp' || appState.activeTenant === 'ufrj';
  const rejectedCount = showUfrjGuides
    ? tenantPayments.filter(p => p.tenantId === 'ufrj' && p.statusId === 'rejeitado').length
    : 0;

  // Histórico recente: os 5 mais recentes ordenados por data desc
  const historicoRecente = [...tenantPayments]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  const syncStatus = appState.tenants[
    appState.activeTenant as keyof typeof appState.tenants
  ]?.status === 'Atrasado' ? 'atrasado' : 'ok';

  return {
    referencia: ref,
    autonomosAtivos,
    variacaoAutonomosMes: autonomosAtivos - autonomosPrevAtivos,
    valorBrutoRepassado,
    valorBrutoRepassadoStr: formatCurrency(valorBrutoRepassado),
    impostosRetidos,
    impostosRetidosStr: formatCurrency(impostosRetidos),
    totalGuiasPendentes: showUfrjGuides ? 14 + rejectedCount : 0,
    lancamentosEmAnalise: emAnalise,
    historicoRecente,
    geradoEm: new Date().toISOString(),
    syncStatus,
  };
}

export function setDashboardReferencia(ref: string) {
  addAuditLog('dashboard', 'CHANGE_REFERENCIA', `Referência alterada para ${ref}`);
  state = { ...state, dashboardReferencia: ref };
  persistState();
  notify();
}

// Mantém a função legada para compatibilidade com outros componentes que já a usam
export function getDerivedTenantMetrics(appState: AppState) {
  const m = getDashboardMetrics(appState);
  const showUfrjGuides = appState.activeTenant === 'corp' || appState.activeTenant === 'ufrj';
  return {
    ufrjPendingGuides: m.totalGuiasPendentes,
    totalCriticalAlerts: m.totalGuiasPendentes,
    totalAtivos: m.autonomosAtivos,
    totalRepassesStr: m.valorBrutoRepassadoStr,
    totalImpostosStr: m.impostosRetidosStr,
  };
}
