import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsIn(['CORP_ADMIN', 'UNIT_OPERATOR', 'AUDITOR'])
  role?: 'CORP_ADMIN' | 'UNIT_OPERATOR' | 'AUDITOR';

  @IsOptional()
  @IsUUID()
  tenantId?: string | null;
}
