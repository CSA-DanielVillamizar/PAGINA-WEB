import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad Evento
 * Representa los eventos de la fundación.
 * Extendido con:
 * - coverImageUrl: Imagen de portada principal.
 * - registrations: JSONB array con registro de participantes { userId, registeredAt, attended, certificateIssued }.
 * - reminders: JSONB array para programar recordatorios { sentAt, type, recipient }.
 */
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  /** Imagen legacy */
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  /** Imagen de portada principal */
  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImageUrl?: string;

  @Column({ type: 'varchar', length: 50, default: 'upcoming' })
  status: string;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  registeredCount: number;

  /** Lista de inscripciones con detalles de asistencia y certificados */
  @Column({ type: 'jsonb', nullable: true })
  registrations?: {
    userId: string
    registeredAt: string
    attended?: boolean
    certificateIssued?: boolean
  }[];

  /** Recordatorios programados o enviados */
  @Column({ type: 'jsonb', nullable: true })
  reminders?: {
    sentAt: string
    type: string
    recipient: string
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
