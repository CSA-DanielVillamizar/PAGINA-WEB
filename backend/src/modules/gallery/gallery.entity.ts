import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * Entidad Álbum de Galería.
 * Representa colecciones de imágenes organizadas por eventos o temáticas.
 * Extendido con:
 * - thumbnailUrl: Miniatura representativa del álbum.
 * - metadata: JSONB con información adicional (fotógrafo, tags, ubicación).
 */
@Entity({ name: 'gallery_albums' })
export class GalleryAlbum {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  titulo: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ type: 'uuid', nullable: true })
  eventoId: string

  /** Array de URLs de imágenes del álbum */
  @Column({ type: 'jsonb', default: [] })
  imagenes: string[]

  /** URL de la miniatura representativa */
  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string

  /** Metadatos adicionales: fotógrafo, tags, ubicación */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    photographer?: string
    tags?: string[]
    location?: string
  }

  @Column({ type: 'timestamptz' })
  fecha: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
