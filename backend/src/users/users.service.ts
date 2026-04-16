import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentRole: UserRole, currentTenantId: string | null, data: CreateUserDto) {
    if (currentRole === 'AUDITOR') {
      throw new ForbiddenException('AUDITOR não pode criar usuários.');
    }

    let targetTenantId = data.tenantId ?? null;

    if (currentRole === 'UNIT_OPERATOR') {
      if (!currentTenantId) {
        throw new ForbiddenException('Tenant inválido para operação.');
      }
      if (targetTenantId && targetTenantId !== currentTenantId) {
        throw new ForbiddenException('UNIT_OPERATOR só pode criar usuário no próprio tenant.');
      }
      if (data.role === 'CORP_ADMIN') {
        throw new ForbiddenException('UNIT_OPERATOR não pode criar CORP_ADMIN.');
      }
      targetTenantId = currentTenantId;
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        tenantId: targetTenantId,
      },
    });
  }

  async findAll(currentRole: UserRole, currentTenantId: string | null, tenantId?: string) {
    if (currentRole === 'UNIT_OPERATOR') {
      return this.prisma.user.findMany({
        where: { tenantId: currentTenantId ?? undefined },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.user.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentRole: UserRole, currentTenantId: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (currentRole === 'UNIT_OPERATOR' && user.tenantId !== currentTenantId) {
      throw new ForbiddenException('Acesso negado a este usuário.');
    }

    return user;
  }

  async update(
    id: string,
    currentRole: UserRole,
    currentTenantId: string | null,
    data: UpdateUserDto,
  ) {
    const user = await this.findOne(id, currentRole, currentTenantId);

    if (currentRole === 'UNIT_OPERATOR') {
      if (data.role === 'CORP_ADMIN' || data.role === 'AUDITOR') {
        throw new ForbiddenException('UNIT_OPERATOR não pode elevar privilégios para esse perfil.');
      }
      if (data.tenantId && data.tenantId !== currentTenantId) {
        throw new ForbiddenException('UNIT_OPERATOR só pode atualizar usuário no próprio tenant.');
      }
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        tenantId: data.tenantId,
      },
    });
  }
}
