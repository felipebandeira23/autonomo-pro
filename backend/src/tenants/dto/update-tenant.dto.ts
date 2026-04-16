import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'document deve conter 14 dígitos numéricos (CNPJ)' })
  document?: string;
}
