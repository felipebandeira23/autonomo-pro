import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Simplificando o JWT extract para fins deste protótipo. 
    // Em cenário real, isso viria de req.user anexado por um strategy Passport JWT/LDAP.
    let userId = request.headers['x-user-id'];
    const requestedTenantId = request.headers['x-tenant-id'];
    const userRoleStr = request.headers['x-user-role'] || 'CORP_ADMIN';
    const requestPath = request.path;

    // Backward compat p/ frontend q ainda não manda token real, resolve pelo PRIMEIRO user da Role
    if (!userId) {
      const fallbackUser = await this.prisma.user.findFirst({
        where: { role: userRoleStr as any }
      });
      if (!fallbackUser) throw new UnauthorizedException('Perfil de Semente Não Encontrado.');
      userId = fallbackUser.id;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não localizado no banco.');
    }

    // Role Enforcement (Global/Corp)
    if (user.role === 'CORP_ADMIN') {
      // Como CORP_ADMIN, eu logo e passo direto em qlqr endpoint.
      await this.auditAccess(user.id, requestedTenantId, requestPath, 'GLOBAL_ACCESS_OVERRIDE');
      request.user = user;
      return true;
    }

    // Role Enforcement (Unit Operator / Auditor)
    // Para esses, o x-tenant-id TEM que ser o deles, não pode virar o de outro.
    if (!requestedTenantId || requestedTenantId !== user.tenantId) {
      await this.auditAccess(user.id, requestedTenantId, requestPath, 'BLOCKED_CROSS_TENANT_ACCESS');
      throw new ForbiddenException(
        `Acesso Horizontal IDOR bloqueado. Seu tenant de sessão (${user.tenantId}) difere do solicitado.`
      );
    }
    
    await this.auditAccess(user.id, user.tenantId, requestPath, 'TENANT_ROUTINE_ACCESS');
    request.user = user;
    return true;
  }

  private async auditAccess(userId: string, tenantId: string | null, path: string, outcome: string) {
    try {
      await this.prisma.tenantAuditLog.create({
        data: {
          userId,
          tenantId: tenantId || null,
          action: 'ACCESS_REQUEST',
          resource: path,
          metadata: { outcome }
        }
      });
    } catch (e) {
      // Falhas de auditoria não devem quebrar a aplicação, mas emitir log STDERR
      console.error('Falha crítica ao auditar trilha transacional:', e);
    }
  }
}
