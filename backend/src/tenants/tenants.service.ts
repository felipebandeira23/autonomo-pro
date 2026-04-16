import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentRole: UserRole, data: CreateTenantDto) {
    if (currentRole !== 'CORP_ADMIN') {
      throw new ForbiddenException('Somente CORP_ADMIN pode criar tenants.');
    }

    return this.prisma.tenant.create({ data });
  }

  async findAll(currentRole: UserRole, currentTenantId: string | null) {
    if (currentRole === 'UNIT_OPERATOR') {
      if (!currentTenantId) {
        return [];
      }
      return this.prisma.tenant.findMany({ where: { id: currentTenantId } });
    }

    return this.prisma.tenant.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(
    id: string,
    currentRole: UserRole,
    currentTenantId: string | null,
  ) {
    if (currentRole === 'UNIT_OPERATOR' && id !== currentTenantId) {
      throw new ForbiddenException('Acesso negado a este tenant.');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado.');
    }
    return tenant;
  }

  async getSummary(
    id: string,
    currentRole: UserRole,
    currentTenantId: string | null,
  ) {
    await this.findOne(id, currentRole, currentTenantId);

    const [ativos, financial, porStatus] = await Promise.all([
      this.prisma.professional.count({
        where: { tenantId: id, status: 'ACTIVE' },
      }),
      this.prisma.payment.aggregate({
        where: { tenantId: id },
        _sum: { grossValue: true, inssValue: true, irrfValue: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where: { tenantId: id },
        _count: { status: true },
      }),
    ]);

    return {
      tenantId: id,
      profissionaisAtivos: ativos,
      totalBruto: Number(financial._sum.grossValue ?? 0),
      impostosRetidos:
        Number(financial._sum.inssValue ?? 0) +
        Number(financial._sum.irrfValue ?? 0),
      pagamentosPorStatus: porStatus.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {},
      ),
    };
  }

  async update(id: string, currentRole: UserRole, data: UpdateTenantDto) {
    if (currentRole !== 'CORP_ADMIN') {
      throw new ForbiddenException('Somente CORP_ADMIN pode atualizar tenant.');
    }

    await this.findOne(id, 'CORP_ADMIN', null);

    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
