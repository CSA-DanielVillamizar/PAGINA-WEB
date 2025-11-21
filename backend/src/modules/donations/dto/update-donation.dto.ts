import { IsNumber, IsString, IsOptional, Min, Length } from 'class-validator'

/**
 * DTO de actualización parcial de donación.
 * Permite actualizar estado, información de pago y metadatos.
 */
export class UpdateDonationDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number

  @IsOptional()
  @IsString()
  @Length(3, 50)
  currency?: string

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
  @IsString()
  status?: string
}
