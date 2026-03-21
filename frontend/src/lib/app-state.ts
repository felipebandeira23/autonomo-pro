"use client";

import { useSyncExternalStore } from 'react';
import { paymentRecords, tenantSummaries, type PaymentRecord, type PaymentStatus } from '@/lib/mock-data';

const STORAGE_KEY = 'autonomo-pro.app-state';

type AppState = {
  paymentStatusOverrides: Partial<Record<string, PaymentStatus>>;
};

const defaultState: AppState = {
  paymentStatusOverrides: {},
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
  state = {
    ...state,
    paymentStatusOverrides: {
      ...state.paymentStatusOverrides,
      [paymentCode]: status,
    },
  };
  persistState();
  notify();
}

export function resetAppState() {
  state = defaultState;
  persistState();
  notify();
}

export function useAppState() {
  return useSyncExternalStore(subscribeToAppState, getAppStateSnapshot, getServerAppStateSnapshot);
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

export function getEffectivePayments(appState: AppState) {
  return paymentRecords.map((payment) => getEffectivePayment(payment, appState));
}

export function getDerivedTenantMetrics(appState: AppState) {
  const effectivePayments = getEffectivePayments(appState);
  const rejectedUfrjCount = effectivePayments.filter(
    (payment) => payment.tenantId === 'ufrj' && payment.statusId === 'rejeitado',
  ).length;

  return {
    ufrjPendingGuides: 14 + rejectedUfrjCount,
    totalCriticalAlerts: 14 + rejectedUfrjCount,
    totalAtivos: tenantSummaries.ufrj.baseAtivos + tenantSummaries.coppetec.baseAtivos,
  };
}
