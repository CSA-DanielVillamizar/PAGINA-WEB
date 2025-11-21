import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad Souvenir
 * Representa los souvenirs o productos de la fundación
 */
@Entity('souvenirs')
export class Souvenir {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 50, default: 'USD' })
  currency: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'jsonb', nullable: true })
  inventory: {
    quantity: number
    reserved: number
    available: number
    lastRestockDate?: Date
  };

  @Column({ type: 'jsonb', default: '[]' })
  transactions: Array<{
    date: Date
    type: 'sale' | 'restock' | 'adjustment' | 'return'
    quantity: number
    userId?: string
    notes?: string
  }>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, default: 'available' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
