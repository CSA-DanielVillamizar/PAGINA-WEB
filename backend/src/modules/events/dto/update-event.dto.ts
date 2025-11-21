import { IsString, IsOptional, IsDateString, IsInt, Min, Length } from 'class-validator'

/**
 * DTO de actualización parcial de evento.
 * Todos los campos son opcionales para permitir actualizaciones incrementales.
 */
export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDateString()
  eventDate?: string

  @IsOptional()
  @IsString()
  @Length(3, 255)
  location?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  registeredCount?: number

  @IsOptional()
  @IsString()
  imageUrl?: string
}
