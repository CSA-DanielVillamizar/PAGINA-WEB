import { IsString, IsInt, IsOptional, IsUUID, Min, Max, Length } from 'class-validator'

/**
 * DTO de actualización parcial de vehículo.
 * Todos los campos son opcionales para soportar parches incrementales.
 * Documentación técnica en español para favorecer mantenibilidad interna.
 */
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @Length(2,100)
  brand?: string

  @IsOptional()
  @IsString()
  @Length(1,100)
  model?: string

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number

  @IsOptional()
  @IsString()
  @Length(4,50)
  licensePlate?: string

  @IsOptional()
  @IsString()
  @Length(5,100)
  vin?: string

  @IsOptional()
  @IsString()
  @Length(3,50)
  color?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  notes?: string

  /** Cambio de propietario (usuario miembro). Mantener historial en servicio. */
  @IsOptional()
  @IsUUID()
  ownerUserId?: string
}
