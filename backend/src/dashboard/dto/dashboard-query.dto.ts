import { IsOptional, Matches } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Formato inválido. Use YYYY-MM.' })
  referencia?: string;
}
