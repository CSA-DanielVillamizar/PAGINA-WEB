import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'gallery_albums' })
export class GalleryAlbum {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ nullable: true })
  eventoId: string

  @Column({ type: 'jsonb', default: [] })
  imagenes: string[]

  @Column({ type: 'timestamptz' })
  fecha: Date
}
