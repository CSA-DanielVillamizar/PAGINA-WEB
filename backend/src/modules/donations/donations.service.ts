import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Donation } from './donation.entity'

@Injectable()
export class DonationsService {
  constructor(@InjectRepository(Donation) private repo: Repository<Donation>) {}

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<Donation>) {
    const donation = this.repo.create(data)
    return this.repo.save(donation)
  }

  async getTotalDonations() {
    const result = await this.repo
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .getRawOne()
    return { total: parseFloat(result.total || '0') }
  }
}
