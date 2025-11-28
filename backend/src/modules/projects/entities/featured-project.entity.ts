import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad Proyectos Destacados
 * Proyectos sociales de la fundación gestionados por roles de junta
 */
@Entity('featured_projects')
export class FeaturedProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column({
    type: 'varchar',
    default: 'comunitario',
    comment: 'Tipo: salud|educacion|comunitario|acompanamiento'
  })
  tipo: string;

  @Column({
    type: 'varchar',
    default: 'En curso',
    comment: 'Estado: En curso|Finalizado|Próximo'
  })
  estado: string;

  @Column({ nullable: true })
  imagenUrl: string;

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date;

  @Column({ type: 'int', default: 0 })
  beneficiarios: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
