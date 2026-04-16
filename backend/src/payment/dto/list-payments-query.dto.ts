import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListPaymentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['DRAFT', 'PENDING_APPROVAL', 'PAID', 'REJECTED'])
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'PAID' | 'REJECTED';

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'competence deve estar no formato MM/YYYY' })
  competence?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
