import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../users/user.entity';

/**
 * Estado de la participación
 */
export enum ParticipantStatus {
  REGISTRADO = 'REGISTRADO',
  CONFIRMADO = 'CONFIRMADO',
  ASISTIO = 'ASISTIO',
  NO_ASISTIO = 'NO_ASISTIO'
}

/**
 * Fuente de registro
 */
export enum RegistrationSource {
  WEB = 'WEB',
  APP = 'APP',
  ADMIN = 'ADMIN'
}

/**
 * Entidad EventParticipant - Representa la participación de un miembro en un evento
 * Registra asistencia, fuente de inscripción y estado
 */
@Entity('event_participants')
export class EventParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, event => event.participantes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  fechaRegistro: Date;

  @Column({
    type: 'enum',
    enum: RegistrationSource,
    default: RegistrationSource.WEB
  })
  fuente: RegistrationSource;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.REGISTRADO
  })
  estado: ParticipantStatus;

  @Column({ type: 'text', nullable: true })
  notas: string;
}
