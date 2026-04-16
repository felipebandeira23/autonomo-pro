import { IsString, Matches, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'document deve conter 14 dígitos numéricos (CNPJ)',
  })
  document: string;
}
