import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

class TaxBracketDto {
  @Type(() => Number)
  @IsNumber()
  min: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number | null;

  @Type(() => Number)
  @IsNumber()
  rate: number;

  @Type(() => Number)
  @IsNumber()
  deduction: number;
}

export class UpdateTaxConfigDto {
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  year: number;

  @Type(() => Number)
  @IsNumber()
  inssRate: number;

  @Type(() => Number)
  @IsNumber()
  inssCeiling: number;

  @Type(() => Number)
  @IsNumber()
  dependentDeduction: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxBracketDto)
  irrfBrackets: TaxBracketDto[];
}
