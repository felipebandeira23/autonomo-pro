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
  if (!str) return 0;
  return Number(str.replace(/[^0-9,-]+/g,"").replace(",", "."));
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export function getDerivedTenantMetrics(appState: AppState) {
  const effectivePayments = getEffectivePayments(appState, true);
  
  const showUfrjGuides = appState.activeTenant === 'corp' || appState.activeTenant === 'ufrj';
  const rejectedUfrjCount = showUfrjGuides ? effectivePayments.filter(
    (payment) => payment.tenantId === 'ufrj' && payment.statusId === 'rejeitado',
  ).length : 0;

  const ativos = appState.activeTenant !== 'corp' 
    ? appState.autonomos.filter(a => a.tenant.toLowerCase() === appState.activeTenant).length 
    : appState.autonomos.length;

  const repassesSum = effectivePayments.reduce((acc, p) => acc + parseCurrency(p.bruto), 0);
  const impostosSum = effectivePayments.reduce((acc, p) => acc + parseCurrency(p.descontos), 0);
  
  return {
    ufrjPendingGuides: showUfrjGuides ? 14 + rejectedUfrjCount : 0,
    totalCriticalAlerts: showUfrjGuides ? 14 + rejectedUfrjCount : 0,
    totalAtivos: ativos,
    totalRepassesStr: formatCurrency(repassesSum),
    totalImpostosStr: formatCurrency(impostosSum),
  };
}
