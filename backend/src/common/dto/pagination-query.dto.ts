import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return 1;
    if (typeof value === 'number') return value;
    return Number(value);
  })
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return 10;
    if (typeof value === 'number') return value;
    return Number(value);
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
