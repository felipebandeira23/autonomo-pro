import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Put,
  Query,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaxConfigDto } from './dto/update-tax-config.dto';

@Controller('tax')
export class TaxController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('config')
  async getConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Query('year') yearParam?: string,
  ) {
    const parsedYear = Number(yearParam);
    const year = Number.isFinite(parsedYear)
      ? parsedYear
      : new Date().getFullYear();
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Parâmetro year deve estar entre 2000 e 2100.');
    }
    const targetTenant = tenantId || 'seed-tenant-ufrj';

    let config = await this.prisma.taxConfig.findFirst({
      where: { tenantId: targetTenant, year },
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
          { min: 0, max: 2259.2, rate: 0.0, deduction: 0.0 },
          { min: 2259.2, max: 2828.65, rate: 0.075, deduction: 169.44 },
          { min: 2828.65, max: 3751.05, rate: 0.15, deduction: 381.44 },
          { min: 3751.05, max: 4664.68, rate: 0.225, deduction: 662.77 },
          { min: 4664.68, max: null, rate: 0.275, deduction: 896.0 },
        ],
      };
    }

    return config;
  }

  @Put('config')
  async updateConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
    @Body() payload: UpdateTaxConfigDto,
  ) {
    if ((role ?? '').toUpperCase() === 'AUDITOR') {
      throw new ForbiddenException(
        'Perfil sem permissao para alterar metas tributarias.',
      );
    }

    const targetTenant = tenantId || 'seed-tenant-ufrj';
    const year = payload.year || new Date().getFullYear();

    const existing = await this.prisma.taxConfig.findFirst({
      where: { tenantId: targetTenant, year },
    });

    if (existing) {
      return this.prisma.taxConfig.update({
        where: { id: existing.id },
        data: {
          inssRate: payload.inssRate,
          inssCeiling: payload.inssCeiling,
          dependentDeduction: payload.dependentDeduction,
          irrfBrackets: payload.irrfBrackets as unknown as Prisma.InputJsonValue,
        },
      });
    }

    throw new BadRequestException(
      'Config base não existe p/ gravar mutation. Semeie o banco primeiro.',
    );
  }
}
