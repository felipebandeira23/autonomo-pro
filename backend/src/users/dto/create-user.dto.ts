import { IsEmail, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsIn(['CORP_ADMIN', 'UNIT_OPERATOR', 'AUDITOR'])
  role: 'CORP_ADMIN' | 'UNIT_OPERATOR' | 'AUDITOR';

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
