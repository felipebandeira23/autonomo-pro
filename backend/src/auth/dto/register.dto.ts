import { IsEmail, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['CORP_ADMIN', 'UNIT_OPERATOR', 'AUDITOR'])
  role: 'CORP_ADMIN' | 'UNIT_OPERATOR' | 'AUDITOR';

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
