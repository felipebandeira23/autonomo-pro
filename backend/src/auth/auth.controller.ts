import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type RequestWithUser = Request & {
  user?: { id: string; role: UserRole; sub?: string };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  async register(@Req() req: RequestWithUser, @Body() body: RegisterDto) {
    return this.authService.register(
      req.user ? { id: req.user.id, role: req.user.role } : null,
      body,
    );
  }

  @Get('me')
  async me(@Req() req: RequestWithUser) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Token de autenticação ausente.');
    }
    return this.authService.me(userId);
  }
}
