"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { setApiConnection } from './app-state';

export function useApiData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableFallback = useMemo(() => fallback, [fallback]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      setApiConnection(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de integração com API';
      setError(message);
      setData(stableFallback);
      setApiConnection(false);
    } finally {
      setLoading(false);
    }
  }, [fetcher, stableFallback]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh };
}

export function useProfessionals(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useApiData(
    () => api.getProfessionals(params),
    { data: [], meta: { total: 0, page: 1, lastPage: 1 } },
    [params?.search, params?.status, params?.page, params?.limit],
  );
}

export function usePayments(params?: {
  status?: string;
  competence?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useApiData(
    () => api.getPayments(params),
    { data: [], meta: { total: 0, page: 1, lastPage: 1 } },
    [params?.status, params?.competence, params?.search, params?.page, params?.limit],
  );
}

export function useTaxConfig(year?: number) {
  return useApiData(() => api.getTaxConfig(year), null, [year]);
}

export function useDashboard(referencia?: string) {
  return useApiData(() => api.getDashboard(referencia), null, [referencia]);
}

export function useTenants() {
  return useApiData(() => api.getTenants(), [], []);
}
