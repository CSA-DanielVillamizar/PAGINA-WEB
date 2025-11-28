import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EventParticipant } from './event-participant.entity';

/**
 * Tipo de actividad del evento
 */
export enum EventType {
  RODADA = 'RODADA',
  ASAMBLEA = 'ASAMBLEA',
  ANIVERSARIO = 'ANIVERSARIO',
  RALLY_NACIONAL = 'RALLY_NACIONAL',
  RALLY_REGIONAL = 'RALLY_REGIONAL',
  RALLY_SUDAMERICANO = 'RALLY_SUDAMERICANO',
  RALLY_INTERNACIONAL = 'RALLY_INTERNACIONAL',
  LAMA_HIERRO = 'LAMA_HIERRO',
  EVENTO_SOCIAL = 'EVENTO_SOCIAL',
  RUTA_ICONICA = 'RUTA_ICONICA',
  OTRO = 'OTRO'
}

/**
 * Nivel de dificultad del evento
 */
export enum EventDifficulty {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA'
}

/**
 * Estado del evento
 */
export enum EventStatus {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
  CANCELADO = 'CANCELADO',
  FINALIZADO = 'FINALIZADO'
}

/**
 * Entidad Event - Representa un evento de la Fundación L.A.M.A. Medellín
 * Soporta rodadas, asambleas, rallys, eventos sociales, etc.
 */
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  slug: string;

  @Column({ type: 'text' })
  descripcionLarga: string;

  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaFin: Date;

  @Column({ type: 'time', nullable: true })
  horaEncuentro: string; // Ejemplo: "18:30"

  @Column({ type: 'time', nullable: true })
  horaSalida: string; // Ejemplo: "19:00"

  @Column({ type: 'varchar', length: 200 })
  destino: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  puntoEncuentro: string; // Ejemplo: "EDS Texaco Palmas"

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.RODADA
  })
  tipoActividad: EventType;

  @Column({
    type: 'enum',
    enum: EventDifficulty,
    default: EventDifficulty.MEDIA
  })
  dificultad: EventDifficulty;

  @Column({ type: 'int', default: 2 })
  duracionHoras: number;

  @Column({ type: 'varchar', length: 200, default: 'Fundación L.A.M.A. Medellín' })
  organizador: string;

  @Column({ type: 'int', default: 0 })
  kilometraje: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkTerminos: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.BORRADOR
  })
  estado: EventStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl: string;

  @OneToMany(() => EventParticipant, participant => participant.event)
  participantes: EventParticipant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
