import {
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  professionalId: string;

  @IsUUID()
  taxConfigId: string;

  @IsNumber()
  @IsPositive()
  grossValue: number;

  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, {
    message: 'competence deve estar no formato MM/YYYY',
  })
  competence: string;

  @IsDateString()
  paymentDate: string;
}
