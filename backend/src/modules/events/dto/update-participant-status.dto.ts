import { IsEnum, IsUUID } from 'class-validator';
import { ParticipantStatus } from '../entities/event-participant.entity';

/**
 * DTO para actualizar el estado de participación (solo admin)
 */
export class UpdateParticipantStatusDto {
  @IsUUID()
  participantId: string;

  @IsEnum(ParticipantStatus)
  estado: ParticipantStatus;
}
