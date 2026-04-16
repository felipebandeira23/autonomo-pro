import { IsIn, IsString, MinLength } from 'class-validator';

export class UpdateProfessionalStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE'])
  status: 'ACTIVE' | 'INACTIVE';

  @IsString()
  @MinLength(5)
  reason: string;
}
