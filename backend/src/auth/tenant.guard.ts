import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PUBLIC_AUTH_PATHS } from './auth.constants';

type JwtRequestUser = {
  sub?: string;
  role?: string;
  tenantId?: string | null;
  tenant_id?: string | null;
  realm_access?: { roles?: string[] };
};

function getSingleHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function mapSystemRole(role?: string): UserRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toUpperCase();
  const roleMap: Record<string, UserRole> = {
    CORP_ADMIN: 'CORP_ADMIN',
    UNIT_OPERATOR: 'UNIT_OPERATOR',
    AUDITOR: 'AUDITOR',
    ADMIN: 'CORP_ADMIN',
    FINANCEIRO: 'UNIT_OPERATOR',
    AUDITORIA: 'AUDITOR',
  };
  return roleMap[normalized] ?? null;
}

function mapKeycloakRole(roles?: string[]): UserRole | null {
  if (!roles?.length) {
    return null;
  }

  const roleMap: Record<string, UserRole> = {
    corp_admin: 'CORP_ADMIN',
    unit_operator: 'UNIT_OPERATOR',
    auditor: 'AUDITOR',
  };

  for (const role of roles) {
    const mapped = roleMap[role.toLowerCase()];
    if (mapped) {
      return mapped;
    }
  }

  return null;
}

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requestPath = request.path as string;

    if (PUBLIC_AUTH_PATHS.has(requestPath)) {
      return true;
    }

    const jwtUser = request.user as JwtRequestUser | undefined;
    let userId = '';
    let requestedTenantId = '';
    let tokenRole: UserRole | null = null;

    if (jwtUser?.sub) {
      userId = jwtUser.sub;
      requestedTenantId = (jwtUser.tenant_id ?? jwtUser.tenantId ?? '').trim();
      tokenRole =
        mapKeycloakRole(jwtUser.realm_access?.roles) ??
        mapSystemRole(jwtUser.role);
    } else {
      userId = getSingleHeaderValue(request.headers['x-user-id']).trim();
      requestedTenantId = getSingleHeaderValue(
        request.headers['x-tenant-id'],
      ).trim();
      tokenRole = mapSystemRole(
        getSingleHeaderValue(request.headers['x-user-role']),
      );
    }

    if (!userId) {
      throw new UnauthorizedException('Usuário não informado na requisição.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não localizado no banco.');
    }

    if (tokenRole && tokenRole !== user.role) {
      await this.auditAccess(
        user.id,
        requestedTenantId !== '' ? requestedTenantId : user.tenantId,
        requestPath,
        'BLOCKED_ROLE_MISMATCH',
      );
      throw new ForbiddenException(
        `Perfil do token divergente do perfil local: token=${tokenRole}, local=${user.role}.`,
      );
    }

    // Role Enforcement (Global/Corp)
    if (user.role === 'CORP_ADMIN') {
      // Como CORP_ADMIN, eu logo e passo direto em qlqr endpoint.
      await this.auditAccess(
        user.id,
        requestedTenantId !== '' ? requestedTenantId : user.tenantId,
        requestPath,
        'GLOBAL_ACCESS_OVERRIDE',
      );
      request.user = user;
      return true;
    }

    // Role Enforcement (Unit Operator / Auditor)
    // Para esses, o x-tenant-id TEM que ser o deles, não pode virar o de outro.
    if (!requestedTenantId || requestedTenantId !== user.tenantId) {
      await this.auditAccess(
        user.id,
        requestedTenantId,
        requestPath,
        'BLOCKED_CROSS_TENANT_ACCESS',
      );
      throw new ForbiddenException(
        `Acesso Horizontal IDOR bloqueado. Seu tenant de sessão (${user.tenantId}) difere do solicitado.`,
      );
    }

    await this.auditAccess(
      user.id,
      user.tenantId,
      requestPath,
      'TENANT_ROUTINE_ACCESS',
    );
    request.user = user;
    return true;
  }

  private async auditAccess(
    userId: string,
    tenantId: string | null,
    path: string,
    outcome: string,
  ) {
    try {
      await this.prisma.tenantAuditLog.create({
        data: {
          userId,
          tenantId: tenantId || null,
          action: 'ACCESS_REQUEST',
          resource: path,
          metadata: { outcome },
        },
      });
    } catch (e) {
      // Falhas de auditoria não devem quebrar a aplicação, mas emitir log STDERR
      console.error('Falha crítica ao auditar trilha transacional:', e);
    }
  }
}
