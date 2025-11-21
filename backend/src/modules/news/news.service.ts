import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { News } from './news.entity'
import { BlobService } from '../../services/blob.service'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'

/**
 * Servicio de noticias.
 * Gestiona el workflow de publicación: draft, scheduled, published.
 * Incluye paginación, filtrado por categoría/tags, incremento de vistas y estadísticas.
 */
@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private repo: Repository<News>,
    private blob: BlobService
  ) {}

  /**
   * Listado paginado y filtrado de noticias.
   * Filtros: status, category, authorId, tags, search (title/excerpt).
   */
  async findAll(options: {
    page?: number
    pageSize?: number
    status?: string
    category?: string
    authorId?: string
    tag?: string
    search?: string
  }) {
    const page = Math.max(options.page || 1, 1)
    const pageSize = Math.min(Math.max(options.pageSize || 10, 1), 100)

    const qb = this.repo.createQueryBuilder('n')
      .leftJoinAndSelect('n.author', 'author')
      .orderBy('n.publishedAt', 'DESC')

    if (options.status) qb.andWhere('n.status = :status', { status: options.status })
    if (options.category) qb.andWhere('n.category = :category', { category: options.category })
    if (options.authorId) qb.andWhere('n.authorId = :authorId', { authorId: options.authorId })
    if (options.tag) {
      qb.andWhere('n.tags @> :tag', { tag: JSON.stringify([options.tag]) })
    }
    if (options.search) {
      qb.andWhere('(n.title ILIKE :s OR n.excerpt ILIKE :s)', { s: `%${options.search}%` })
    }

    qb.skip((page - 1) * pageSize).take(pageSize)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  async findRecent(limit = 10) {
    return this.repo.find({
      where: { status: 'published' },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
      take: limit
    })
  }

  async findOne(id: string) {
    const news = await this.repo.findOne({ where: { id }, relations: ['author'] })
    if (!news) throw new NotFoundException('Noticia no encontrada')
    return news
  }

  async create(dto: CreateNewsDto) {
    const news = this.repo.create({
      ...dto,
      viewCount: 0
    })
    return this.repo.save(news)
  }

  async update(id: string, dto: UpdateNewsDto) {
    const news = await this.findOne(id)
    const updated: any = { ...dto }
    if (dto.publishedAt) {
      updated.publishedAt = new Date(dto.publishedAt)
    }
    await this.repo.update(id, updated)
    return this.findOne(id)
  }

  async delete(id: string) {
    const news = await this.findOne(id)
    await this.repo.delete(news.id)
    return { ok: true }
  }

  /**
   * Publicar noticia (cambiar status y establecer publishedAt).
   */
  async publish(id: string) {
    const news = await this.findOne(id)
    if (news.status === 'published') {
      throw new BadRequestException('Noticia ya publicada')
    }
    await this.repo.update(id, {
      status: 'published',
      publishedAt: new Date()
    })
    return this.findOne(id)
  }

  /**
   * Despublicar noticia (volver a draft).
   */
  async unpublish(id: string) {
    const news = await this.findOne(id)
    await this.repo.update(id, { status: 'draft' })
    return this.findOne(id)
  }

  /**
   * Incrementar contador de vistas.
   */
  async incrementView(id: string) {
    const news = await this.findOne(id)
    await this.repo.update(id, { viewCount: news.viewCount + 1 })
    return this.findOne(id)
  }

  /**
   * Subir imagen destacada.
   */
  async uploadFeaturedImage(id: string, file: Express.Multer.File) {
    const news = await this.findOne(id)
    if (!file) throw new BadRequestException('Archivo no recibido')
    const key = `news/${id}/featured-${Date.now()}-${file.originalname}`
    const url = await this.blob.uploadFile(key, file.buffer, file.mimetype)
    await this.repo.update(id, { featuredImageUrl: url })
    return this.findOne(id)
  }

  /**
   * Estadísticas de noticias.
   */
  async stats() {
    const total = await this.repo.count()
    const published = await this.repo.count({ where: { status: 'published' } })
    const draft = await this.repo.count({ where: { status: 'draft' } })
    
    const mostViewed = await this.repo.find({
      where: { status: 'published' },
      order: { viewCount: 'DESC' },
      take: 5
    })

    const recent = await this.repo.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: 5
    })

    return { total, published, draft, mostViewed, recent }
  }
}
