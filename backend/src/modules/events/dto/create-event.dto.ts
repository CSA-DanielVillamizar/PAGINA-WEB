import { IsString, IsEnum, IsOptional, IsDateString, IsInt, Min, IsUrl, MaxLength, MinLength } from 'class-validator';
import { EventType, EventDifficulty, EventStatus } from '../entities/event.entity';

/**
 * DTO para crear un nuevo evento
 * Sistema completo L.A.M.A. Medellín: rodadas, rallys, asambleas, eventos sociales
 */
export class CreateEventDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  titulo: string;

  @IsString()
  @MinLength(3)
  @MaxLength(250)
  slug: string;

  @IsString()
  @MinLength(20)
  descripcionLarga: string;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  horaEncuentro?: string; // Formato: "18:30"

  @IsOptional()
  @IsString()
  horaSalida?: string; // Formato: "19:00"

  @IsString()
  @MaxLength(200)
  destino: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  puntoEncuentro?: string;

  @IsEnum(EventType)
  tipoActividad: EventType;

  @IsEnum(EventDifficulty)
  dificultad: EventDifficulty;

  @IsInt()
  @Min(1)
  duracionHoras: number;

  @IsString()
  @MaxLength(200)
  organizador: string;

  @IsInt()
  @Min(0)
  kilometraje: number;

  @IsOptional()
  @IsUrl()
  linkTerminos?: string;

  @IsEnum(EventStatus)
  estado: EventStatus;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;
}
