import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApplicationForm } from './application-form.entity'

@Injectable()
export class FormsService {
  constructor(@InjectRepository(ApplicationForm) private repo: Repository<ApplicationForm>) {}

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<ApplicationForm>) {
    const form = this.repo.create(data)
    return this.repo.save(form)
  }
}
