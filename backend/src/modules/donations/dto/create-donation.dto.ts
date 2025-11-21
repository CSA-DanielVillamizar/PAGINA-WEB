import { IsNumber, IsString, IsOptional, IsUUID, Min, Length } from 'class-validator'

/**
 * DTO de creación de donación.
 * Valida los campos requeridos para registrar una nueva donación.
 * Incluye información de pago y referencia de usuario opcional.
 */
export class CreateDonationDto {
  @IsNumber()
  @Min(0.01)
  amount: number

  @IsString()
  @Length(3, 50)
  currency: string

  @IsOptional()
  @IsString()
  @Length(3, 100)
  paymentMethod?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string

  @IsOptional()
  @IsString()
  transactionId?: string

  @IsOptional()
  @IsUUID()
  userId?: string

  @IsOptional()
  @IsString()
  status?: string
}
