import { Controller, Get, Post, Body, Patch, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { Prisma, ProfessionalStatus } from '@prisma/client';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly appService: ProfessionalsService) {}

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (!tenantId || !role) throw new BadRequestException('Faltando headers de autenticação contextual.');
    return this.appService.findAll(
      tenantId, 
      role.toUpperCase(), 
      search, 
      status, 
      page ? parseInt(page) : 1, 
      limit ? parseInt(limit) : 10
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string
  ) {
    return this.appService.findOne(id, tenantId, role.toUpperCase());
  }

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
    @Body() payload: Prisma.ProfessionalUncheckedCreateInput
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ausente.');
    payload.tenantId = payload.tenantId || tenantId; // Override fallback
    return this.appService.create(payload, role.toUpperCase());
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() payload: { status: ProfessionalStatus, reason: string }
  ) {
    if (!userId || !userRole || !tenantId) throw new BadRequestException('Sessão inválida para ação destrutiva');
    return this.appService.updateStatus(id, payload.status, payload.reason, userId, userRole.toUpperCase(), tenantId);
  }
}
