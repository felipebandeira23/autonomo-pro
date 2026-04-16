export type TenantViewKey = 'ufrj' | 'coppetec';

const TENANT_KEY_MAP: Record<string, TenantViewKey> = {
  ufrj: 'ufrj',
  coppetec: 'coppetec',
};

export function mapTenantIdToViewKey(tenantId: string): TenantViewKey {
  const normalized = tenantId.trim().toLowerCase();

  if (TENANT_KEY_MAP[normalized]) {
    return TENANT_KEY_MAP[normalized];
  }

  if (normalized.includes('coppetec')) {
    return 'coppetec';
  }

  return 'ufrj';
}
