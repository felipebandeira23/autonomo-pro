import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma, ProfessionalStatus } from '@prisma/client';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { ListProfessionalsQueryDto } from './dto/list-professionals-query.dto';
import { UpdateProfessionalStatusDto } from './dto/update-professional-status.dto';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly appService: ProfessionalsService) {}

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
    @Query() query: ListProfessionalsQueryDto,
  ) {
    if (tenantId === undefined || !role) {
      throw new BadRequestException(
        'Faltando headers de autenticação contextual.',
      );
    }

    return this.appService.findAll(
      tenantId,
      role.toUpperCase(),
      query.search,
      query.status,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.appService.findOne(id, tenantId, role.toUpperCase());
  }

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
    @Body() payload: CreateProfessionalDto,
  ) {
    if (tenantId === undefined) {
      throw new BadRequestException('Tenant ausente.');
    }

    const professionalPayload: Prisma.ProfessionalUncheckedCreateInput = {
      ...payload,
      status: 'ACTIVE' as ProfessionalStatus,
      tenantId: payload.tenantId || tenantId,
    };

    return this.appService.create(professionalPayload, role.toUpperCase());
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() payload: UpdateProfessionalStatusDto,
  ) {
    if (!userId || !userRole || tenantId === undefined) {
      throw new BadRequestException('Sessão inválida para ação destrutiva');
    }

    return this.appService.updateStatus(
      id,
      payload.status as ProfessionalStatus,
      payload.reason,
      userId,
      userRole.toUpperCase(),
      tenantId,
    );
  }
}
