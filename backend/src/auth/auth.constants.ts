export const JWT_FALLBACK_SECRET =
  'autonomo-pro-dev-secret-change-in-production';

export const PUBLIC_AUTH_PATHS = new Set(['/auth/login', '/auth/login/']);

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET deve ser definido em produção.');
  }

  return secret || JWT_FALLBACK_SECRET;
}
