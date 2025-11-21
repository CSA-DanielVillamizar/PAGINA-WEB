import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Entidad Noticia
 * Representa las noticias y actualizaciones de la fundación.
 * Extendido con:
 * - tags: Array JSONB de etiquetas/categorías.
 * - viewCount: Contador de visualizaciones.
 * - featuredImageUrl: Imagen destacada separada de imageUrl legacy.
 */
@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  /** Imagen legacy */
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  /** Imagen destacada principal */
  @Column({ type: 'varchar', length: 500, nullable: true })
  featuredImageUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  authorId: string;

  /** Etiquetas/tags para clasificación */
  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  /** Contador de visualizaciones */
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
