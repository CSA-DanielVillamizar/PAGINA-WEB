import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { News } from './news.entity'

@Injectable()
export class NewsService {
  constructor(@InjectRepository(News) private repo: Repository<News>) {}

  async findAll() {
    return this.repo.find({ order: { publishedAt: 'DESC' } })
  }

  async findRecent(limit = 10) {
    return this.repo.find({ 
      order: { publishedAt: 'DESC' },
      take: limit
    })
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<News>) {
    const news = this.repo.create(data)
    return this.repo.save(news)
  }

  async update(id: string, data: Partial<News>) {
    await this.repo.update(id, data)
    return this.findOne(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { ok: true }
  }
}
