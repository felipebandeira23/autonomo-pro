import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type RequestWithUser = Request & {
  user?: { id: string; role: UserRole; tenantId: string | null };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: CreateUserDto) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.usersService.create(role, req.user?.tenantId ?? null, body);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser, @Query('tenantId') tenantId?: string) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.usersService.findAll(role, req.user?.tenantId ?? null, tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.usersService.findOne(id, role, req.user?.tenantId ?? null);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    const role = req.user?.role ?? 'UNIT_OPERATOR';
    return this.usersService.update(id, role, req.user?.tenantId ?? null, body);
  }
}
