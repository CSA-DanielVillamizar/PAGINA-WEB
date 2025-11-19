import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Event } from './event.entity'

@Injectable()
export class EventsService {
  constructor(@InjectRepository(Event) private repo: Repository<Event>) {}

  async findAll() {
    return this.repo.find({ order: { eventDate: 'DESC' } })
  }

  async findUpcoming() {
    return this.repo.find({
      where: { status: 'upcoming' },
      order: { eventDate: 'ASC' }
    })
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<Event>) {
    const event = this.repo.create(data)
    return this.repo.save(event)
  }

  async update(id: string, data: Partial<Event>) {
    await this.repo.update(id, data)
    return this.findOne(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { ok: true }
  }
}
