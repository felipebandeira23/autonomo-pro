import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProfessionalStatus, UserRole } from '@prisma/client';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, role: string, search?: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProfessionalWhereInput = {};

    // Only filter by tenant if NOT Corp Admin
    if (role !== 'CORP_ADMIN' && role !== 'AUDITOR') {
      whereClause.tenantId = tenantId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } as Prisma.StringFilter },
        { document: { contains: search } }
      ];
    }

    if (status) {
      whereClause.status = status as ProfessionalStatus;
    }

    const [data, total] = await Promise.all([
      this.prisma.professional.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          tenant: { select: { name: true } }
        },
        orderBy: { name: 'asc' }
      }),
      this.prisma.professional.count({ where: whereClause })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, tenantId: string, role: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: {
        inssSources: true,
        legalDeds: true,
        auditLogs: {
          include: { performedBy: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    if (role !== 'CORP_ADMIN' && role !== 'AUDITOR' && professional.tenantId !== tenantId) {
      throw new ForbiddenException('Acesso negado a este recurso.');
    }

    return professional;
  }

  async create(data: Prisma.ProfessionalUncheckedCreateInput, userRole: string) {
    if (userRole === 'AUDITOR') {
      throw new ForbiddenException('Auditores não podem criar registros.');
    }
    return this.prisma.professional.create({ data });
  }

  async updateStatus(
    id: string, 
    status: ProfessionalStatus, 
    reason: string, 
    userId: string, 
    userRole: string,
    tenantId: string
  ) {
    if (userRole === 'AUDITOR') {
      throw new ForbiddenException('Auditores não podem alterar status.');
    }

    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('Motivo obrigatório e deve ser detalhado.');
    }

    const professional = await this.prisma.professional.findUnique({ where: { id } });
    if (!professional) throw new NotFoundException('Profissional não encontrado');

    if (userRole !== 'CORP_ADMIN' && professional.tenantId !== tenantId) {
      throw new ForbiddenException('Você não tem permissão neste tenant.');
    }

    if (professional.status === status) {
      throw new BadRequestException(`Status já é ${status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.professional.update({
        where: { id },
        data: { status }
      });

      await tx.professionalAuditLog.create({
        data: {
          professionalId: id,
          action: status === 'ACTIVE' ? 'REACTIVATE' : 'DEACTIVATE',
          reason,
          performedById: userId,
          snapshotMap: professional as unknown as Prisma.JsonObject
        }
      });

      return updated;
    });
  }
}
