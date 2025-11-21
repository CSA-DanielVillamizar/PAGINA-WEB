import { IsString, IsInt, IsOptional, IsUUID, Min, Max, Length } from 'class-validator'

/**
 * DTO de creación de vehículo.
 * Define y valida los campos requeridos para registrar un nuevo vehículo.
 * Reglas clave:
 * - "licensePlate" debe ser única y entre 4-50 caracteres.
 * - "year" se valida en un rango razonable (1900 - año actual + 1).
 * - Campos opcionales permiten extensibilidad sin sobrecargar el modelo base.
 */
export class CreateVehicleDto {
  @IsString()
  @Length(2,100)
  brand: string

  @IsString()
  @Length(1,100)
  model: string

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number

  @IsString()
  @Length(4,50)
  licensePlate: string

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

  /** Usuario (miembro) propietario inicial del vehículo */
  @IsOptional()
  @IsUUID()
  ownerUserId?: string
}
