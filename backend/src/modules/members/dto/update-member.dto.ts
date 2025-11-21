import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator'

/**
 * DTO Actualización Perfil Miembro
 */
export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  membershipNumber?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  chapter?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  membershipType?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string

  @IsOptional()
  @IsDateString()
  memberSince?: string

  @IsOptional()
  @IsDateString()
  renewalDate?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  socialLinks?: Record<string, string>
}
