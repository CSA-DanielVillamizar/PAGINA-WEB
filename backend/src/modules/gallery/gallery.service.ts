import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GalleryAlbum } from './gallery.entity'
import { BlobService } from '../../services/blob.service'
import { CreateGalleryAlbumDto } from './dto/create-gallery-album.dto'
import { UpdateGalleryAlbumDto } from './dto/update-gallery-album.dto'

/**
 * Servicio de galería.
 * Gestiona álbumes fotográficos: paginación, carga masiva de imágenes,
 * generación de thumbnails y estadísticas.
 */
@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryAlbum) private repo: Repository<GalleryAlbum>,
    private blob: BlobService
  ) {}

  /**
   * Listado paginado y filtrado de álbumes.
   */
  async findAll(options: {
    page?: number
    pageSize?: number
    eventoId?: string
    search?: string
  }) {
    const page = Math.max(options.page || 1, 1)
    const pageSize = Math.min(Math.max(options.pageSize || 10, 1), 100)

    const qb = this.repo.createQueryBuilder('g').orderBy('g.fecha', 'DESC')

    if (options.eventoId) qb.andWhere('g.eventoId = :eventoId', { eventoId: options.eventoId })
    if (options.search) {
      qb.andWhere('(g.titulo ILIKE :s OR g.descripcion ILIKE :s)', { s: `%${options.search}%` })
    }

    qb.skip((page - 1) * pageSize).take(pageSize)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  async findOne(id: string) {
    const album = await this.repo.findOne({ where: { id } })
    if (!album) throw new NotFoundException('Álbum no encontrado')
    return album
  }

  async create(dto: CreateGalleryAlbumDto) {
    const album = this.repo.create({
      ...dto,
      fecha: new Date(dto.fecha),
      imagenes: []
    })
    return this.repo.save(album)
  }

  async update(id: string, dto: UpdateGalleryAlbumDto) {
    const album = await this.findOne(id)
    const updated: any = { ...dto }
    if (dto.fecha) {
      updated.fecha = new Date(dto.fecha)
    }
    await this.repo.update(id, updated)
    return this.findOne(id)
  }

  async delete(id: string) {
    const album = await this.findOne(id)
    await this.repo.delete(album.id)
    return { ok: true }
  }

  /**
   * Carga masiva de imágenes al álbum.
   */
  async bulkUploadImages(id: string, files: Express.Multer.File[]) {
    const album = await this.findOne(id)
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron archivos')
    }

    const stored: string[] = []
    for (const file of files) {
      const key = `gallery/${id}/${Date.now()}-${file.originalname}`
      const url = await this.blob.uploadFile(key, file.buffer, file.mimetype)
      stored.push(url)
    }

    const imagenes = [...album.imagenes, ...stored]
    await this.repo.update(id, { imagenes })

    // Si no hay thumbnail, usar la primera imagen subida
    if (!album.thumbnailUrl && stored.length > 0) {
      await this.repo.update(id, { thumbnailUrl: stored[0] })
    }

    return this.findOne(id)
  }

  /**
   * Agregar una sola imagen al álbum.
   */
  async addImage(id: string, imageUrl: string) {
    const album = await this.findOne(id)
    const imagenes = [...album.imagenes, imageUrl]
    await this.repo.update(id, { imagenes })
    return this.findOne(id)
  }

  /**
   * Establecer thumbnail del álbum.
   */
  async setThumbnail(id: string, file: Express.Multer.File) {
    const album = await this.findOne(id)
    if (!file) throw new BadRequestException('Archivo no recibido')

    const key = `gallery/${id}/thumbnail-${Date.now()}-${file.originalname}`
    const url = await this.blob.uploadFile(key, file.buffer, file.mimetype)
    await this.repo.update(id, { thumbnailUrl: url })
    return this.findOne(id)
  }

  /**
   * Eliminar imagen del álbum por índice.
   */
  async removeImage(id: string, index: number) {
    const album = await this.findOne(id)
    if (index < 0 || index >= album.imagenes.length) {
      throw new BadRequestException('Índice de imagen inválido')
    }
    const imagenes = album.imagenes.filter((_, i) => i !== index)
    await this.repo.update(id, { imagenes })
    return this.findOne(id)
  }

  /**
   * Estadísticas de galería.
   */
  async stats() {
    const total = await this.repo.count()
    const totalImages = await this.repo
      .createQueryBuilder('g')
      .select('SUM(jsonb_array_length(g.imagenes))', 'count')
      .getRawOne()
    
    const recent = await this.repo.find({ order: { createdAt: 'DESC' }, take: 5 })
    
    return {
      totalAlbums: total,
      totalImages: parseInt(totalImages.count || '0'),
      recent
    }
  }
}
