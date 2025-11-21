import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad Vehículo
 * Representa los vehículos de la fundación.
 * Se extendió para soportar:
 * - Historial de propiedad (ownershipHistory) como arreglo de eventos JSONB.
 * - Referencia al usuario propietario actual (ownerUserId).
 * - Arreglo de imágenes adicionales (images) además de una imagen principal opcional (imageUrl legacy).
 */
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  licensePlate: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vin: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 100, default: 'active' })
  status: string;

  /** Observaciones libres */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /** Imagen principal heredada (legacy) */
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  /** Usuario propietario actual */
  @Column({ type: 'uuid', nullable: true })
  ownerUserId?: string;

  /** Historial de eventos de transferencia/actualización de propiedad */
  @Column({ type: 'jsonb', nullable: true })
  ownershipHistory?: { date: string; action: string; userId?: string }[];

  /** Lista de urls de imágenes adicionales */
  @Column({ type: 'jsonb', nullable: true })
  images?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
