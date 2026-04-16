import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

type RequestWithUser = Request & {
  user?: { id: string; role: UserRole; tenantId: string | null };
};

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: CreateTenantDto) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.tenantsService.create(role, body);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.tenantsService.findAll(role, req.user?.tenantId ?? null);
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.tenantsService.findOne(id, role, req.user?.tenantId ?? null);
  }

  @Get(':id/summary')
  async getSummary(@Req() req: RequestWithUser, @Param('id') id: string) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.tenantsService.getSummary(id, role, req.user?.tenantId ?? null);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateTenantDto,
  ) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.tenantsService.update(id, role, body);
  }
}
