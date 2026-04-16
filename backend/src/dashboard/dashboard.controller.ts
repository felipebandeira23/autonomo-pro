import { Controller, Get, Headers, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @Query() query: DashboardQueryDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    const referencia =
      query.referencia ?? new Date().toISOString().slice(0, 7);

    return this.dashboardService.getDashboard(
      referencia,
      tenantId ?? '',
      (userRole ?? 'UNIT_OPERATOR').toUpperCase(),
    );
  }
}
