import { IsEmail, IsInt, IsOptional, IsString, IsUUID, Matches, Min } from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'document deve conter 11 dígitos numéricos' })
  document: string;

  @IsOptional()
  @IsString()
  identity?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  pisVoter?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  numDependents?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  agency?: string;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsString()
  nature?: string;

  @IsOptional()
  @IsString()
  functionalType?: string;

  @IsOptional()
  @IsString()
  teacherClassification?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
