import { IsOptional, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator'

/**
 * DTO Creación Perfil Miembro
 * Define los campos permitidos para crear un perfil de miembro.
 */
export class CreateMemberDto {
  @IsUUID()
  userId: string

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
