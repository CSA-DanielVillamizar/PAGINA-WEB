import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MemberProfile } from './member-profile.entity'

@Injectable()
export class MembersService {
  constructor(@InjectRepository(MemberProfile) private repo: Repository<MemberProfile>) {}

  async findAll() {
    return this.repo.find({ relations: ['user'] })
  }

  async findOne(userId: string) {
    return this.repo.findOne({ where: { userId }, relations: ['user'] })
  }

  async create(data: Partial<MemberProfile>) {
    const profile = this.repo.create(data)
    return this.repo.save(profile)
  }

  async update(userId: string, data: Partial<MemberProfile>) {
    await this.repo.update({ userId }, data)
    return this.findOne(userId)
  }

  async delete(userId: string) {
    await this.repo.delete({ userId })
    return { ok: true }
  }
}
