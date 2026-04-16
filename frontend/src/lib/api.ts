const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FrontendRole = 'admin' | 'financeiro' | 'auditoria';

interface RequestOptions {
  method?: string;
  body?: unknown;
  tenantId?: string;
  userRole?: string;
  userId?: string;
}

function mapRole(frontendRole: FrontendRole | string): string {
  const map: Record<string, string> = {
    admin: 'CORP_ADMIN',
    financeiro: 'UNIT_OPERATOR',
    auditoria: 'AUDITOR',
  };
  return map[frontendRole] || 'CORP_ADMIN';
}

function normalizeBase(base: string): string {
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function withApiPrefix(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (API_BASE.startsWith('http')) {
    return `${normalizeBase(API_BASE)}${cleanEndpoint}`;
  }

  return `${normalizeBase(API_BASE)}/api${cleanEndpoint}`;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, tenantId, userRole, userId } = options;

  const storedState =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('autonomo-pro.app-state') || '{}')
      : {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId || storedState.activeTenantId || '',
    'x-user-role': userRole || mapRole(storedState.role || 'admin'),
    'x-user-id': userId || storedState.userId || '',
  };

  const res = await fetch(withApiPrefix(endpoint), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: res.statusText || `API Error ${res.status}` }));
    throw new Error(err.message || `API Error ${res.status}`);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  getProfessionals: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiFetch<{
      data: unknown[];
      meta: { total: number; page: number; lastPage: number };
    }>(`/professionals?${query.toString()}`);
  },
  getProfessional: (id: string) => apiFetch(`/professionals/${id}`),
  createProfessional: (data: unknown) =>
    apiFetch('/professionals', { method: 'POST', body: data }),
  updateProfessionalStatus: (id: string, status: string, reason: string) =>
    apiFetch(`/professionals/${id}/status`, {
      method: 'PATCH',
      body: { status, reason },
    }),

  getPayments: (params?: {
    status?: string;
    competence?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.competence) query.set('competence', params.competence);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiFetch<{
      data: unknown[];
      meta: { total: number; page: number; lastPage: number };
    }>(`/payments?${query.toString()}`);
  },
  createPayment: (data: unknown) =>
    apiFetch('/payments', { method: 'POST', body: data }),
  submitPayment: (id: string) =>
    apiFetch(`/payments/${id}/submit`, { method: 'PATCH' }),
  approvePayment: (id: string) =>
    apiFetch(`/payments/${id}/approve`, { method: 'PATCH' }),
  rejectPayment: (id: string, reason: string) =>
    apiFetch(`/payments/${id}/reject`, {
      method: 'PATCH',
      body: { reason },
    }),
  downloadReceipt: (id: string) => `${normalizeBase(API_BASE)}/payments/${id}/receipt`,

  getTaxConfig: (year?: number) => {
    const query = year ? `?year=${year}` : '';
    return apiFetch(`/tax/config${query}`);
  },
  updateTaxConfig: (data: unknown) =>
    apiFetch('/tax/config', { method: 'PUT', body: data }),

  getDashboard: (referencia?: string) => {
    const query = referencia ? `?referencia=${referencia}` : '';
    return apiFetch(`/dashboard${query}`);
  },

  getTenants: () => apiFetch('/tenants'),
  getTenantSummary: (id: string) => apiFetch(`/tenants/${id}/summary`),
  createTenant: (data: unknown) => apiFetch('/tenants', { method: 'POST', body: data }),
  updateTenant: (id: string, data: unknown) =>
    apiFetch(`/tenants/${id}`, { method: 'PATCH', body: data }),
};
