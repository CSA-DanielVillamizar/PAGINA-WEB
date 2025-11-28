import { IsEmail, IsOptional, IsString } from 'class-validator'

/**
 * DTO para recepción de solicitudes de inscripción desde frontend.
 * Documenta únicamente los campos críticos; el resto se acepta como metadata.
 */
export class SendInscriptionDto {
  @IsString()
  fullName!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  metadata?: any

  @IsOptional()
  @IsString()
  pdfBase64?: string

  @IsOptional()
  @IsString()
  pdfFileName?: string
}
