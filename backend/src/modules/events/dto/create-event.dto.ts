import { IsString, IsOptional, IsDateString, IsInt, Min, Length } from 'class-validator'

/**
 * DTO de creación de evento.
 * Valida los campos necesarios para crear un nuevo evento de la fundación.
 * Documentación técnica en español para facilitar el mantenimiento interno.
 */
export class CreateEventDto {
  @IsString()
  @Length(3, 255)
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsDateString()
  eventDate: string

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
  @IsString()
  imageUrl?: string
}
