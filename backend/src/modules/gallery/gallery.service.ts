import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GalleryAlbum } from './gallery.entity'

@Injectable()
export class GalleryService {
  constructor(@InjectRepository(GalleryAlbum) private repo: Repository<GalleryAlbum>) {}

  async findAll() {
    return this.repo.find({ order: { fecha: 'DESC' } })
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<GalleryAlbum>) {
    const album = this.repo.create(data)
    return this.repo.save(album)
  }

  async update(id: string, data: Partial<GalleryAlbum>) {
    await this.repo.update(id, data)
    return this.findOne(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { ok: true }
  }

  async addImage(id: string, imageUrl: string) {
    const album = await this.findOne(id)
    if (!album) throw new Error('Album not found')
    const imagenes = [...album.imagenes, imageUrl]
    await this.repo.update(id, { imagenes })
    return this.findOne(id)
  }
}
