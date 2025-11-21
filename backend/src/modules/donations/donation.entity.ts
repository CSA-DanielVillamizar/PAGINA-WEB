import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Entidad Donación
 * Representa las donaciones realizadas por usuarios.
 * Extendido con:
 * - paymentInfo: JSONB con detalles completos del pago (gateway, fees, reference).
 * - receiptUrl: URL del recibo PDF generado.
 * - receiptNumber: Número único de recibo para referencia fiscal.
 */
@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', length: 50, default: 'completed' })
  status: string;

  /** Información detallada del pago (gateway, fees, metadata) */
  @Column({ type: 'jsonb', nullable: true })
  paymentInfo?: {
    gateway?: string
    fees?: number
    reference?: string
    metadata?: Record<string, any>
  };

  /** URL del recibo PDF generado */
  @Column({ type: 'varchar', length: 500, nullable: true })
  receiptUrl?: string;

  /** Número único de recibo para referencia fiscal */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  receiptNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
