import { Controller, Get, Query, Headers, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard?referencia=2026-02
   * Headers obrigatórios:
   *   x-tenant-id  — ID do tenant ou vazio para visão corporativa
   *   x-user-role  — CORP_ADMIN | UNIT_OPERATOR | AUDITOR
   *
   * Retorna DashboardDto com todos os campos numéricos garantidos (nunca NaN).
   */
  @Get()
  async getDashboard(
    @Query('referencia') referencia: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (!referencia) {
      throw new BadRequestException('Parâmetro "referencia" obrigatório (ex: 2026-02)');
    }

    // Validação de formato YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(referencia)) {
      throw new BadRequestException('Formato inválido. Use YYYY-MM.');
    }

    return this.dashboardService.getDashboard(
      referencia,
      tenantId ?? '',
      (userRole ?? 'UNIT_OPERATOR').toUpperCase(),
    );
  }
}
