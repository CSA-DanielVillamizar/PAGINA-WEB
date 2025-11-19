import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Souvenir } from './souvenir.entity'

@Injectable()
export class SouvenirsService {
  constructor(@InjectRepository(Souvenir) private repo: Repository<Souvenir>) {}

  async findAll() {
    return this.repo.find()
  }

  async findByCategory(categoria: string) {
    return this.repo.find({ where: { category: categoria } })
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<Souvenir>) {
    const souvenir = this.repo.create(data)
    return this.repo.save(souvenir)
  }

  async update(id: string, data: Partial<Souvenir>) {
    await this.repo.update(id, data)
    return this.findOne(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { ok: true }
  }

  async updateInventory(id: string, quantity: number) {
    const souvenir = await this.findOne(id)
    if (!souvenir) throw new Error('Souvenir not found')
    const newInventory = souvenir.stock + quantity
    await this.repo.update(id, { stock: newInventory })
    return this.findOne(id)
  }
}
