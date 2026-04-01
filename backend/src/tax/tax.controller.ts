import { Controller, Get, Put, Body, Headers, BadRequestException, ForbiddenException, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tax')
export class TaxController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('config')
  async getConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Query('year') yearParam?: string
  ) {
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    // Se o frontend enviar empty (CORP_ADMIN) vamos pegar a master config
    const targetTenant = tenantId || 'seed-tenant-ufrj';
    
    let config = await this.prisma.taxConfig.findFirst({
      where: { tenantId: targetTenant, year }
    });

    if (!config) {
      config = await this.prisma.taxConfig.findFirst();
    }

    if (!config) {
      return {
        year: 2026,
        inssRate: 0.11,
        inssCeiling: 932.32,
        dependentDeduction: 189.59,
        irrfBrackets: [
          { min: 0, max: 2259.20, rate: 0.0, deduction: 0.0 },
          { min: 2259.20, max: 2828.65, rate: 0.075, deduction: 169.44 },
          { min: 2828.65, max: 3751.05, rate: 0.15, deduction: 381.44 },
          { min: 3751.05, max: 4664.68, rate: 0.225, deduction: 662.77 },
          { min: 4664.68, max: null, rate: 0.275, deduction: 896.00 }
        ]
      };
    }
    return config;
  }

  @Put('config')
  async updateConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
    @Body() payload: any
  ) {
    if (role === 'AUDITOR') {
      throw new ForbiddenException('Perfil sem permissao para alterar metas tributarias.');
    }

    const targetTenant = tenantId || 'seed-tenant-ufrj';
    const year = payload.year || new Date().getFullYear();

    const existing = await this.prisma.taxConfig.findFirst({
      where: { tenantId: targetTenant, year }
    });

    if (existing) {
      return this.prisma.taxConfig.update({
        where: { id: existing.id },
        data: {
          inssRate: payload.inssRate,
          inssCeiling: payload.inssCeiling,
          dependentDeduction: payload.dependentDeduction,
          irrfBrackets: payload.irrfBrackets
        }
      });
    }

    throw new BadRequestException('Config base não existe p/ gravar mutation. Semeie o banco primeiro.');
  }
}
