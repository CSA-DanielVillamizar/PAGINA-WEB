import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegistrationSource } from '../entities/event-participant.entity';

/**
 * DTO para inscribirse a un evento
 */
export class RegisterEventDto {
  @IsOptional()
  @IsEnum(RegistrationSource)
  fuente?: RegistrationSource;

  @IsOptional()
  @IsString()
  notas?: string;
}
